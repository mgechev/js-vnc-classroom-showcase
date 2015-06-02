'use strict';

var RFB = require('rfb');
var socketio = require('socket.io');
var Png = require('../node_modules/node-png/build/Release/png').Png;
var ES6Promise = require('es6-promise').Promise;
var uid = require('uid');
var clients = [];
var counter = 0;

var keyboardEnabled = true;
var mouseEnabled = true;

var credentialsProvider = function (credentials) {
  credentials.keyboardEnabled = keyboardEnabled;
  credentials.mouseEnabled = mouseEnabled;
  return ES6Promise.resolve(credentials);
};

function getClient(id) {
  return clients.filter(function (c) {
    return c.id === id;
  }).pop();
}

function encodeFrame(rect) {
  var rgb = new Buffer(rect.width * rect.height * 3, 'binary');
  var offset = 0;
  for (var i = 0; i < rect.fb.length; i += 4) {
    rgb[offset] = rect.fb[i + 2];
    offset += 1;
    rgb[offset] = rect.fb[i + 1];
    offset += 1;
    rgb[offset] = rect.fb[i];
    offset += 1;
  }
  var image = new Png(rgb, rect.width, rect.height, 'rgb');
  return image.encodeSync();
}

function addEventHandlers(r, socket, id) {
  var initialized = false;
  var screenWidth;
  var screenHeight;

  function handleConnection(width, height) {
    screenWidth = width;
    screenHeight = height;
    console.info('RFB connection established');
    var client = getClient(id);
    socket.emit('init', {
      width: width,
      height: height,
      keyboardEnabled: client.keyboardEnabled,
      mouseEnabled: client.mouseEnabled
    });
    client.socket = socket;
    client.id = counter++;
    client.interval = setInterval(function () {
      r.requestUpdate({
        x: 0,
        y: 0,
        width: width,
        height: height,
        subscribe: 1
      });
    }, 50);
    r.requestRedraw();
    initialized = true;
  }

  r.on('error', function (e) {
    console.error('Error while talking with the remote RFB server', e);
  });

  r.on('raw', function (rect) {
    if (!initialized) {
      handleConnection(rect.width, rect.height);
    }
    socket.emit('frame', {
      x: rect.x,
      y: rect.y,
      width: rect.width,
      height: rect.height,
      image: encodeFrame(rect).toString('base64')
    });
    r.requestUpdate({
      x: 0,
      y: 0,
      subscribe: 1,
      width: screenWidth,
      height: screenHeight
    });
  });

  r.on('*', function () {
    console.error(arguments);
  });
}

function createRfbConnection(config, socket) {
  return credentialsProvider(config)
  .then(function (config) {
    var r = RFB({
      host: config.host,
      port: config.port,
      password: config.password,
      securityType: 'vnc',
    });
    var id = uid(10);
    clients.push({
      id: id,
      rfb: r,
      mouseEnabled: config.mouseEnabled,
      keyboardEnabled: config.keyboardEnabled
    });
    setTimeout(function () {
      r.requestRedraw();
    }, 200);
    addEventHandlers(r, socket, id);
    return id;
  }).catch(function (e) {
    console.error('Fatal error', e);
    return e;
  });
}

function disconnectClient(socket) {
  clients.forEach(function (c) {
    if (c.socket === socket) {
      c.rfb.end();
      clearInterval(c.interval);
      clients.delete(c.rfb);
      return;
    }
  });
}

function start(port) {
  var io = socketio(port, { log: false });
  console.log('Listening on port', port);

  io.sockets.on('connection', function (socket) {
    console.info('Client connected');
    socket.on('init', function (config) {
      createRfbConnection(config, socket)
      .then(function (id) {
        var c = getClient(id);
        var r = c.rfb;
        console.log(c.id);
        socket.on('mouse', function (evnt) {
          if (c.mouseEnabled) {
            r.sendPointer(evnt.x, evnt.y, evnt.button);
          }
        });
        socket.on('keyboard', function (evnt) {
          if (c.keyboardEnabled) {
            r.sendKey(evnt.keyCode, evnt.isDown);
          }
        });
        socket.on('disconnect', function () {
          disconnectClient(socket);
          console.info('Client disconnected');
        });
      }).catch(function (e) {
        console.error('Cannot connect', e);
      });
    });
  });
}

function setCredentialsProvider(provider) {
  if (!provider || typeof provider !== 'function') {
    throw new Error('The credentials provider must be a function', provider);
  }
  credentialsProvider = provider;
}

module.exports = {
  start: start,
  setCredentialsProvider: setCredentialsProvider
};
