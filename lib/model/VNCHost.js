'use strict';

function VNCHost(config) {
  this.id = config.id;
  this.readToken = config.readToken;
  this.writeToken = config.writeToken;
  this.hostname = config.hostname;
  this.port = config.port;
  this.password = config.password;
}

module.exports = VNCHost;
