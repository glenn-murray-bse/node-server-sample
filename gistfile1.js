#!/usr/bin/env node

var fs = require('fs');
var http = require('http');
var url = require('url');
var mysql = require('mysql');

var db = mysql.createConnection({});
db.connect();

var template = function(vars, callback) {
    fs.readFile('base.html', { flag: 'r' }, function(err, data) {
        if(err) {throw err;}
        Object.keys(vars).forEach(function(k){
            data.replace(new RegExp('{{'+k+'}}','g'), vars[k]);
        });
        callback(data);
    });
};

http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    var params = url.parse(req.url, true).query;
    var end = res.end.bind(res);
    var index = function(vars) {
        fs.readFile('index.html', function(err, data) {
            if(err) {throw err;}
            template(vars, end);
        });
    };
    if (req.url === '/') {
        index({ content: data });
    } else if (req.url === '/db') {
        db.query('select * from users where ? LIMIT 1', {name: params.name}, function(err, rows, field){
            if(err) {throw err;}
            index({ content: data, rows: rows });
        })
    } else if (req.url === '/remote') {
        http.request(params, function(response){
            response.on('data', res.write.bind(res));
            response.on('end', end)
        });
    } else {
        fs.readFile(req.url, function(err, data){
            if(err) {throw err;}
            template({ content: data, input: params.input }, end);
        });  
    }
}).listen(80, function(err) {
    if(err) {throw err;}
    console.log('Server running at http://127.0.0.1:80/');
});
console.log('Server starting');