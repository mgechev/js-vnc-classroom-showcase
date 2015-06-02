/* global Screen, Client */
(function () {
  'use strict';

  var canvas = document.getElementById('screen');
  var screen = new Screen(canvas);
  var search = location.search;
  search = search.substring(1, search.length);
  var client = new Client(screen);
  client.connect({
    token: search
  }).then(function () {
    document.getElementById('loading').style.display = 'none';
    document.getElementById('screen-wrapper').style.display = 'block';
  });

}());
