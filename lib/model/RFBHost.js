'use strict';

function RFBHost(config) {
  this.id = config.id;
  this.hostname = config.hostname;
  this.port = config.port;
  this.password = config.password;
}

module.exports = RFBHost;
