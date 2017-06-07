'use strict';

var pckg = require('./package.json');

module.exports = function prepareTags (config) {
  var tags = pickFromEnv();
  tags.push(config.environment);
  // Add magistrate version
  tags.push([pckg.name, 'version', pckg.version].join('_'));
  if (config.tags) return tags.concat(config.tags);
  return tags;
};

function pickFromEnv () {
  return Object.keys(process.env).map(function (key) {
    if (key.indexOf('_VERSION') > -1) return key.toLowerCase() + '_' + process.env[key];
  }).filter(Boolean);
}
