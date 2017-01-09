'use strict';

// Checks if all the hard dependency services are avilable

module.exports = function fullfilledServices (config) {
  if (!config.services || !config.services.length) return true;
  var exist = 0;
  config.services.forEach(function (service) {
    if (config[service]) exist++;
  });
  if (config.services.length === exist) return true;
  console.log({
    expected: config.services,
    config: config
  }, '[magistrate] Missing hard service dependency.');
  return false;
};
