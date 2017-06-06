'use strict';

var consul = require('./consul-client.js')();
var timer = null;

module.exports = handler;

function handler (err, cb) {
  if (err && err.statusCode === 500) {
    if (!timer) {
      console.log('[magistrate] Lost contact with Consul cluster');
      timer = setTimeout(retryFn, 30 * 1000); // 30 seconds
    }
    return true;
  }
  return false;
}

function retryFn () {
  consul.status.leader(function (err, result) {
    if (err || !result) {
      console.error('[magistrate] No Consul cluster leader, exiting!');
      process.exit(1);
    } else {
      timer = null;
      console.log('[magistrate] Contact restored with Consul cluster');
    }
  });
}
