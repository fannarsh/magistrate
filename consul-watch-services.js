'use strict';

var consul = require('./consul-client.js')();

module.exports = function consulWatchServices (cb) {
  var watcher = consul.watch({
    method: consul.catalog.service.list,
    options: {}
  });

  watcher.on('error', function (err) {
    console.log('error:', err);
    cb(err);
  });
  watcher.on('change', function (data, res) {
    cb(null, data);
  });
};
