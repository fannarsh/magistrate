'use strict';

var path = require('path');
var internalIp = require('internal-ip');
var pkg = require(path.dirname(require.main.filename) + '/package.json');

var pkgConfig = pkg.config || {};
var config = {
  name: process.env.SERVICE_NAME || pkg.name,
  version: pkg.version,
  port: pkgConfig.port,
  services: pkgConfig.services,
  environment: process.env.NODE_ENV || 'development',
  consul: process.env.CONSUL || process.env.LOCAL_CONSUL || false,
  ip_address: internalIp.v4(),
  log_level: process.env.LOG_LEVEL || 'info'
};

console.log('[magistrate] Base configuration is:', config);
module.exports = config;
