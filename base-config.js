'use strict';

var fs = require('fs');
var path = require('path');
var xtend = require('xtend');
var internalIp = require('internal-ip');
var pkg = require(path.dirname(require.main.filename) + '/package.json');

var pkgConfig = pkg.config || {};
var config = {
  name: pkg.name,
  version: pkg.version,
  port: pkgConfig.port,
  services: pkgConfig.services,
  environment: 'development',
  consul: false,
  ip_address: internalIp.v4(),
  log_level: 'info'
};

if (process.env.CONFIG_FILE) {
  var localConfig;
  try {
    localConfig = fs.readFileSync(process.env.CONFIG_FILE, 'utf8');
    localConfig = JSON.parse(localConfig);
  } catch (e) {
    throw e;
  }
  console.log('[magistrate] Using local configuration file');
  config = xtend(config, localConfig);
}

if (process.env.SERVICE_NAME) config.name = process.env.SERVICE_NAME;
if (process.env.NODE_ENV) config.environment = process.env.NODE_ENV;
if (process.env.CONSUL || process.env.LOCAL_CONSUL) config.consul = true;
if (process.env.LOG_LEVEL) config.log_level = process.env.LOG_LEVEL;

console.log('[magistrate] Base configuration is:', config);
module.exports = config;
