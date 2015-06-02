'use strict';

function VNCHost(config) {
  this.host = config.host;
  this.port = config.port;
  this.password = config.password;
}

module.exports = VNCHost;
