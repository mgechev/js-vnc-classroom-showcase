'use strict';

var data = {};
var AccessRegistry = {
  get: function (id) {
    return data[id];
  },
  set: function (id, accessRights) {
    console.log(id);
    data[id] = accessRights;
  },
  getAll: function () {
    return JSON.parse(JSON.stringify(data));
  }
};

module.exports = AccessRegistry;
