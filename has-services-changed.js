'use strict';

var diff = require('deep-diff').diff;

module.exports = function hasServicesChanged (config, oldServices, services) {
  var difference = diff(oldServices, services) || [];
  return difference.map(function (item) {
    return item.path[0];
  }).some(function (service) {
    return config.services.indexOf(service) > -1;
  });
};
