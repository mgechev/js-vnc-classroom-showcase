'use strict';

var proxy = require('./lib/proxy');
var express = require('express');
var http = require('http');

var app = express();
var server = http.createServer(app);

app.engine('.html', require('ejs').__express);
app.set('views', __dirname + '/views');
app.set('view engine', 'html');
app.use(express.static(__dirname + '/assets/'));


app.get('/admin', function (req, res) {
  res.redirect(301, '/admin/hosts/list');
});
app.get('/admin/hosts/list', function (req, res) {
  res.render('list-hosts');
});
app.get('/admin/hosts/add', function (req, res) {
  res.render('add-host');
});

server.listen(8090);
//proxy.init(5555);
