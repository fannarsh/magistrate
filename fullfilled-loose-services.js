'use strict';

// Checks if all the loose dependency services are avilable

module.exports = function fullfilledServices (config) {
  if (!config.loose_services || !config.loose_services.length) return true;
  var exist = 0;
  config.loose_services.forEach(function (service) {
    if (config[service]) exist++;
  });
  if (config.loose_services.length === exist) return true;
  return false;
};
