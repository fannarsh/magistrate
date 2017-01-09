'use strict';

var fastparallel = require('fastparallel');

var consul = require('./consul-client.js')();
var simplifyService = require('./simplify-service.js');
var cws = require('./consul-watch-services.js');

var parallel = fastparallel();

var servicesCmprStr = '[]';

module.exports = function consulServices (config, cb) {
  if (!expectedServices(config).length) return cb(null, {});
  cws(function (err, data) {
    if (err) return cb(err);

    iterateServices(config, function (err, results) {
      if (err) return cb(err);
      finish(results, cb);
    });
  });
};

function iterateServices (config, cb) {
  var services = expectedServices(config);
  var environment = config.environment;
  parallel({}, fetchService, services, cb);

  function fetchService (service, done) {
    consul.health.service({
      service: service,
      tag: environment,
      passing: true
    }, function (err, result) {
      if (err) return cb(err);
      done(null, simplify(result));
    });
  }
}

function simplify (services) {
  return services.map(simplifyService);
}

function finish (result, cb) {
  // We don't wan't to send a callback if nothing changed.
  if (!hasChanged(result)) return;

  servicesCmprStr = JSON.stringify(result);
  delayChanged(mergeUnderName(result), cb);
}

var delayChangedTimer;
function delayChanged (services, cb) {
  clearTimeout(delayChangedTimer);
  delayChangedTimer = setTimeout(function () {
    // console.log('[magistrate][consul-services] recived services:', services);
    cb(null, services);
  }, 200);
}

function mergeUnderName (services) {
  var serviceByName = {};
  services = [].concat.apply([], services); // flatten
  services.forEach(storeByName);
  return serviceByName;

  function storeByName (service) {
    if (!serviceByName[service.name]) {
      serviceByName[service.name] = [];
    }
    serviceByName[service.name].push({
      host: service.host,
      port: service.port
    });
  }
}

function hasChanged (services) {
  var newCmpr = JSON.stringify(services);
  // console.log(servicesCmprStr + '\n' + newCmpr);
  return servicesCmprStr !== newCmpr;
}

function expectedServices (config) {
  var hard = config.services || [];
  var lose = config.lose_services || [];
  return hard.concat(lose);
}
