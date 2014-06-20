#!/usr/bin/env node

var fs = require('fs');
var http = require('http');
var url = require('url');
var mysql = require('mysql');

var db = mysql.createConnection({});
db.connect();

var render = function render(content, vars, callback) {
    if(vars instanceof Function) {
        callback = vars;
        vars = {};
    }
    fs.readFile('base.html', { flag: 'r' }, function load_template(err, data) {
        if(err) {throw err;}
        fs.readFile(content, function load_content(err, data) {
            if(err) {throw err;}
            vars.content = data;
            Object.keys(vars).forEach(function(k){
                data.replace(new RegExp('{{'+k+'}}','g'), vars[k]);
            });
            callback(data);
        });
    });
};

http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    var params = url.parse(req.url, true).query;
    var end = res.end.bind(res);
    if (req.url === '/') {
        render('index.html', end);
    } else if (req.url === '/db') {
        db.query('select * from users where ? LIMIT 1', {name: params.name}, function(err, rows, field){
            if(err) {throw err;}
            render('index.html', { rows: rows }, end);
        });
    } else if (req.url === '/remote') {
        http.request(params, function(response){
            response.on('data', res.write.bind(res));
            response.on('end', end);
        });
    } else {
        render(req.url, { input: params.input }, end);
    }
}).listen(80, function(err) {
    if(err) {throw err;}
    console.log('Server running at http://127.0.0.1:80/');
});
console.log('Server starting');