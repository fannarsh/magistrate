'use strict';

var consul = require('./consul-client.js')();
var transform = require('./transform-data.js');

module.exports = function consulWatchStore (prefix, cb) {
  var watcher = consul.watch({
    method: consul.kv.get,
    options: { key: prefix, recurse: true }
  });

  watcher.on('error', function (err) {
    console.log('consul watch store error:', err);
    cb(err);
  });
  watcher.on('change', function (data, res) {
    if (!data) {
      var error = new Error('Missing directory/path: ' + prefix + ' in kv store');
      error.path = prefix;
      error.fatal = true;
      return cb(error);
    }
    cb(null, transform(prefix, data));
  });
};
