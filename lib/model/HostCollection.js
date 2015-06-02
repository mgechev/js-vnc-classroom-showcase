'use strict';

function HostCollection() {
  this._data = [];
}

HostCollection.prototype.add = function (vm) {
  this._data.push(vm);
};

HostCollection.prototype.remove = function (vm) {
  this._data.splice(this._data.indexOf(vm), 1);
};

HostCollection.prototype.getAll = function () {
  return this._data.slice();
};

module.exports = HostCollection;
