'use strict';

var consul = require('./consul-client.js')();
var transform = require('./transform-data.js');
var errorHandler = require('./consul-watch-error-handler.js');

module.exports = function consulWatchStore (prefix, cb) {
  var watcher = consul.watch({
    method: consul.kv.get,
    options: { key: prefix, recurse: true }
  });

  watcher.on('error', function (err) {
    if (errorHandler(err, cb)) return;
    cb(err);
  });
  watcher.on('change', function (data, res) {
    if (!data) {
      var error = new Error('Missing directory/path: ' + prefix + ' in kv store');
      error.path = prefix;
      error.clean_exit = true;
      return cb(error);
    }
    cb(null, transform(prefix, data));
  });
};
