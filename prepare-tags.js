'use strict';

module.exports = function prepareTags (config) {
  var tags = pickFromEnv();
  tags.push(config.environment);
  if (config.tags) return tags.concat(config.tags);
  return tags;
};

function pickFromEnv () {
  return Object.keys(process.env).map(function (key) {
    if (key.indexOf('_VERSION') > -1) return key.toLowerCase() + '_' + process.env[key];
  }).filter(Boolean);
}
