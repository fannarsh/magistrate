'use strict';

var events = require('events');
var inherits = require('util').inherits;
var xtend = require('xtend');

var baseConfig = require('./base-config.js');
var cws = require('./consul-watch-store.js');
var cserv = require('./consul-services.js');
var prepareTags = require('./prepare-tags.js');
var fullfilledServices = require('./fullfilled-services.js');

var consulRegister = require('./consul-register.js');

module.exports = Magistrate;
Magistrate.prototype.service = consulRegister;

function Magistrate () {
  if (!(this instanceof Magistrate)) return new Magistrate();

  events.EventEmitter.call(this);

  this._combined_config = this._service_config = this._base_config = baseConfig;
  this._cluster_settings = {};
  this._services;

  this._cluster_settings_populated;
  this._service_config_populated;
  this._services_populated;
  this._ready_sent;

  var self = this;
  process.nextTick(function () { self.setConfiguration(); });
}

inherits(Magistrate, events.EventEmitter);

Magistrate.prototype.setConfiguration = function setConfiguration () {
  console.log('[magistrate] Set configuration');

  if (!this._base_config.consul) {
    var exec = process.env.EXEC;
    if (!exec) throw new Error('An executable is missing! Set env variable EXEC or CONSUL');
    this._service_config_populated = true;

    if (this._base_config.services && this._base_config.services.length && !fullfilledServices(this._base_config)) {
      console.log('[magistrate] No consul, no service discovery, missing services:', this._base_config.services);
      // todo : better handling of missing services, (fallback to local_config).
      this._services_populated = false;
    } else {
      this._services_populated = true;
    }

    this.settings(null, { exec: exec });
  } else {
    cws(kvPrefix('cluster_settings', this._base_config), this.settings.bind(this));
    cws(kvPrefix('service_config', this._base_config), this.config.bind(this));
    cserv(this._base_config, this.services.bind(this));
  }
};

function kvPrefix (name, config) {
  return [name, config.name, config.environment].join('/');
}

Magistrate.prototype.settings = function settings (err, data) {
  if (err) {
    if (err.fatal) throw err;
    return console.log({ error: err }, 'Error reciving cluster settings');
  }
  this._cluster_settings = data;
  if (process.env.CLUSTER_SIZE) this._cluster_settings.size = Number(process.env.CLUSTER_SIZE);
  this._cluster_settings_populated = true;
  this._emitChange();
  return this._cluster_settings;
};

Magistrate.prototype.config = function config (err, data) {
  if (err) {
    if (err.fatal) throw err;
    return console.log({ error: err }, 'Error reciving service config');
  }
  this._service_config = xtend(this._base_config, data);
  // This is the only time we add tags from kv store, there is no special handling when tags appears via watching
  this._service_config.tags = prepareTags(this._service_config);
  this._combined_config = xtend(this._service_config, this._services);
  this._combined_config.fullfilled_services = fullfilledServices(this._combined_config);
  this._service_config_populated = true;
  this._emitChange();
  return this._combined_config;
};

Magistrate.prototype.services = function services (err, data) {
  console.log('[magistrate] Change in services:', data);
  if (errorHandler(err, function () {
    this.services(null, []);
  }.bind(this))) return;
  this._services = data;
  this._combined_config = xtend(this._service_config, this._services);
  this._combined_config.fullfilled_services = fullfilledServices(this._combined_config);
  this._services_populated = this._services_populated || this._combined_config.fullfilled_services;
  this._emitChange();
  return this._combined_config;
};

Magistrate.prototype.getConfig = function getConfig () {
  return JSON.parse(JSON.stringify(this._combined_config));
};

Magistrate.prototype._emitChange = function _emitChange () {
  var settings = JSON.parse(JSON.stringify(this._cluster_settings));
  var config = JSON.parse(JSON.stringify(this._combined_config));
  if (this._ready_sent) this.emit('change', settings, config);

  if (!this._ready_sent && this._cluster_settings_populated && this._service_config_populated && this._services_populated) {
    this._ready_sent = true;
    this.emit('ready', settings, config);
  }
};

var errorHandlingTimer;
function errorHandler (error, retryFn) {
  clearTimeout(errorHandlingTimer);
  if (error) {
    errorHandlingTimer = setTimeout(retryFn, 2000);
    console.log({ error: error }, 'Error in service discovery');
    return true;
  }
  return false;
}
