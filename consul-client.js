'use strict';

var consul = require('consul');
var config = require('./base-config.js');

var client;
module.exports = function () {
  if (!config.consul) return;
  if (client) return client;
  var opts = {};
  // Mostly for testing locally, usually we trust that there's a agent running on localhost
  if (process.env.LOCAL_CONSUL) opts.host = process.env.LOCAL_CONSUL;
  client = consul(opts);
  return client;
};
