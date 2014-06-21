#!/usr/bin/env node

var http = require('http');
var url = require('url');
var mysql = require('mysql');

var db = mysql.createConnection({});
db.connect();

var render = require('./lib/render');

var server = http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    var params = url.parse(req.url, true).query;
    var end = res.end.bind(res);
    if (req.url === '/') {
        render('index.html', end);
    } else if (req.url === '/db') {
        db.query('select * from users where ? LIMIT 1', {name: params.name}, function(err, rows, field) {
            if(err) {throw err;}
            render('index.html', { rows: rows }, end);
        });
    } else if (req.url === '/remote') {
        http.request(params, function(response) {
            response.on('data', res.write.bind(res));
            response.on('end', end);
        });
    } else {
        render('./' + req.url, { input: params.input }, end);
    }
}).listen(8080, function(err) {
    if(err) {throw err;}
    console.log('Server running at http://localhost:' + server.address().port + '/');
});
console.log('Server starting');