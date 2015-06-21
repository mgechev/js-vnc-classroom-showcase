'use strict';

function RFBHostCollection() {
  this._data = [];
}

RFBHostCollection.prototype.add = function (vm) {
  this._data.push(vm);
};

RFBHostCollection.prototype.remove = function (vm) {
  this._data.splice(this._data.indexOf(vm), 1);
};

RFBHostCollection.prototype.getAll = function () {
  return this._data.slice();
};

module.exports = RFBHostCollection;
