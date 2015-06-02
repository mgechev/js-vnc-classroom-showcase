'use strict';

var proxy = require('./lib/proxy');

var express = require('express');
var http = require('http');
var uid = require('uid');
var bodyParser = require('body-parser')

var app = express();
var server = http.createServer(app);

var HostCollection = require('./lib/model/HostCollection');
var list = new HostCollection();
var VNCHost = require('./lib/model/VNCHost');
var urlencodedParser = bodyParser.urlencoded({ extended: false });

list.add(new VNCHost({
  hostname: '192.168.0.100',
  port: 5900,
  password: 'demo',
  readToken: uid(10),
  writeToken: uid(10),
  id: uid(5)
}));

list.add(new VNCHost({
  hostname: '192.168.0.101',
  port: 5900,
  password: 'demo',
  readToken: uid(10),
  writeToken: uid(10),
  id: uid(5)
}));

list.add(new VNCHost({
  hostname: '192.168.0.121',
  port: 5900,
  password: 'paralaks',
  readToken: uid(10),
  writeToken: uid(10),
  id: uid(5)
}));


app.engine('.html', require('ejs').__express);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');
app.use(express.static(__dirname + '/assets/'));


app.get('/admin', function (req, res) {
  res.redirect(301, '/admin/hosts/list');
});
app.get('/admin/hosts/list', function (req, res) {
  res.render('list-hosts', {
    hosts: list.getAll()
  });
});
app.get('/admin/hosts/add', function (req, res) {
  res.render('add-host');
});
app.post('/admin/hosts', urlencodedParser, function (req, res) {
  list.add(new VNCHost({
    id: uid(5),
    readToken: uid(10),
    writeToken: uid(10),
    hostname: req.body.hostname,
    port: req.body.port,
    password: req.body.password
  }));
  res.redirect(301, '/admin/hosts/list');
});

server.listen(8090);
//proxy.init(5555);
