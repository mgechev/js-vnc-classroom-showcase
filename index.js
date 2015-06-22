'use strict';

var proxy = require('./lib/proxy');

var express = require('express');
var http = require('http');
var uid = require('uid');
var bodyParser = require('body-parser');
var ES6Promise = require('es6-promise').Promise;

var app = express();
var server = http.createServer(app);

var RFBHostCollection = require('./lib/model/RFBHostCollection');
var list = new RFBHostCollection();
var RFBHost = require('./lib/model/RFBHost');
var RemoteConnection = require('./lib/model/RemoteConnection');
var AccessRegistry = require('./lib/model/AccessRegistry');
var ACCESS_RIGHTS = require('./lib/model/ACCESS_RIGHTS');
var urlencodedParser = bodyParser.urlencoded({ extended: false });

function generateAccessTokens(id) {
  var tokens = Object.keys(ACCESS_RIGHTS).map(function (key) {
    var obj = {};
    obj[key + 'Token'] = uid(5);
    return obj;
  }).reduce(function (a, c) {
    for (var key in c) {
      a[key] = c[key];
    }
    return a;
  }, {});
  AccessRegistry.set(id, tokens);
}

var id = uid(5);
generateAccessTokens(id);
list.add(new RFBHost({
  hostname: '192.168.0.100',
  port: 5900,
  password: 'paralaks',
  readToken: uid(10),
  writeToken: uid(10),
  id: id
}));

var id = uid(5);
generateAccessTokens(id);
list.add(new RFBHost({
  hostname: '192.168.0.101',
  port: 5900,
  password: 'demo',
  readToken: uid(10),
  writeToken: uid(10),
  id: id
}));

var id = uid(5);
generateAccessTokens(id);
list.add(new RFBHost({
  hostname: '192.168.0.121',
  port: 5900,
  password: 'paralaks',
  readToken: uid(10),
  writeToken: uid(10),
  id: id
}));

app.engine('.html', require('ejs').__express);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');
app.use(express.static(__dirname + '/assets/'));

app.get('/', function (req, res) {
  res.render('vnc');
});
app.get('/admin', function (req, res) {
  res.redirect(301, '/admin/hosts/list');
});
app.get('/admin/hosts/list', function (req, res) {
  res.render('list-hosts', {
    hosts: list.getAll(),
    accessTokens: AccessRegistry.getAll()
  });
});
app.get('/admin/hosts/add', function (req, res) {
  res.render('add-host');
});
app.post('/admin/hosts', urlencodedParser, function (req, res) {
  var id = uid(5);
  list.add(new RFBHost({
    id: id,
    hostname: req.body.hostname,
    port: req.body.port,
    password: req.body.password
  }));
  var accessRights = generateAccessTokens();
  AccessRegistry.set(id, accessRights);
  res.redirect(301, '/admin/hosts/list');
});
app.get('/admin/hosts/delete/:id', function (req, res) {
  list.getAll().forEach(function (c) {
    if (c.id === req.params.id) {
      list.remove(c);
      return;
    }
  });
  res.redirect(301, '/admin/hosts/list');
});

server.listen(8090);
proxy.setCredentialsProvider(function (credentials) {
  var token = credentials.token;
  // Optimize
  var accessRights = AccessRegistry.getAll();
  var id = Object.keys(accessRights).filter(function (k) {
    var a = accessRights[k];
    for (var key in a) {
      if (a[key] === token) {
        return true;
      }
    }
    return false;
  }).pop();
  var host = list.getAll().filter(function (c) {
    return c.id === id;
  }).pop();
  console.log(host, token, credentials);
  if (host) {
    var keyboardEnabled;
    var mouseEnabled;
    if (host.writeToken === token) {
      keyboardEnabled = mouseEnabled = true;
    } else {
      keyboardEnabled = mouseEnabled = false;
    }
    // RemoteSession object
    // connects RFBHost with access rights
    return ES6Promise.resolve(new RemoteConnection({
      host: host,
      accessRights: {
        keyboardEnabled: keyboardEnabled,
        mouseEnabled: mouseEnabled
      }
    }));
  }
  return ES6Promise.reject();
});

proxy.start(5555);
