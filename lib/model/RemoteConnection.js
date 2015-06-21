'use strict';

function RemoteConnection(config) {
  this.host = config.host;
  this.accessRights = config.accessRights;
}

module.exports = RemoteConnection;
