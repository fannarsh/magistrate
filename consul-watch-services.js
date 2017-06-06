'use strict';

var consul = require('./consul-client.js')();
var errorHandler = require('./consul-watch-error-handler.js');

module.exports = function consulWatchServices (cb) {
  var watcher = consul.watch({
    method: consul.catalog.service.list,
    options: {}
  });

  watcher.on('error', function (err) {
    if (errorHandler(err, cb)) return;
    cb(err);
  });
  watcher.on('change', function (data, res) {
    cb(null, data);
  });
};
