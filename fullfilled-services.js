'use strict';

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
  }, 'Missing hard service dependency.');
  return false;
};
