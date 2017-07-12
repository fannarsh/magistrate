'use strict';

var consul = require('./consul-client.js')();
var exitHook = require('exit-hook');

var serviceId;

module.exports.createServiceObject = createServiceObject;
module.exports.register = register;
module.exports.deregister = deregister;
module.exports.maintenance = maintenance;

function createServiceObject (config) {
  var service = {
    id: config.name,
    name: config.name,
    address: config.ip_address,
    port: config.port,
    tags: config.tags
  };
  service.checks = createChecks(config);
  console.log('[magistrate] Created service object:', service);
  return service;
}

function register (service, cb) {
  if (!cb) cb = noop;
  if (!consul) return cb('Consul client doesn\'t exist');
  if (!service) return cb('Missing service');

  consul.agent.service.register(service, function (err) {
    if (err) console.error({ service: service, error: err }, 'Error while registering service');
    serviceId = service.id;
    // Make sure that we deregister this service when the process is terminating
    exitHook(function (next) {
      console.log('[magistrate] exit-hook un-register service');
      deregister(function (err, id) {
        console.log('[magistrate] deregistering service %s', id, (err || ''));
        next();
      });
    });
    cb(err, service);
  });
}

function deregister (cb) {
  if (!cb) cb = noop;
  if (!consul) return cb('Consul client doesn\'t exist');

  consul.agent.service.deregister({ id: serviceId }, function (err) {
    if (err) console.error({ service_id: serviceId, error: err }, 'Error while deregistering service');
    cb(err, serviceId);
  });
}

function maintenance (enable, reason, cb) {
  if (!cb) cb = noop;
  if (!consul) return cb('Consul client doesn\'t exist');

  consul.agent.service.maintenance({
    id: serviceId,
    enable: enable,
    reason: reason
  }, function (err) {
    if (err) console.error({ service_id: serviceId, error: err }, 'Error toggling maintenance mode');
    cb(err, serviceId);
  });
}

function createChecks (config) {
  if (config.health_check_type === 'http') {
    return [ createHttpCheck(config) ];
  } else if (config.health_check_type === 'tcp') {
    return [ createTcpCheck(config) ];
  }
  return undefined;
}

function createTcpCheck (config) {
  return {
    name: config.name + ' tcp call',
    tcp: config.ip_address + ':' + config.port,
    interval: '10s',
    timeout: '1s'
  };
}

function createHttpCheck (config) {
  return {
    name: config.name + ' http call',
    http: 'http://' + config.ip_address + ':' + config.port + '/',
    interval: '10s',
    timeout: '1s'
  };
}

function noop () {}
