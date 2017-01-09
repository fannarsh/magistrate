'use strict';

// Checks if all the lose dependency services are avilable

module.exports = function fullfilledServices (config) {
  if (!config.lose_services || !config.lose_services.length) return true;
  var exist = 0;
  config.lose_services.forEach(function (service) {
    if (config[service]) exist++;
  });
  if (config.lose_services.length === exist) return true;
  return false;
};
