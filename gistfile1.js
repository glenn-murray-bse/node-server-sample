#!/usr/bin/env node

var fs = require('fs');
var http = require('http');
var url = require('url');
var mysql = require('mysql');

var db = mysql.createConnection({});
db.connect();

var template = function(vars, callback) {
    fs.readFile('base.html', { flag: 'r' }, function(err, data) {
        Object.keys(vars).forEach(function(k){
            data.replace(new RegExp('{{'+k+'}}','g'), vars[k]);
        });
        callback(data);
    });
}

http.createServer(function (req, res) {
    res.writeHead(200, {'Content-Type': 'text/html'});
    var params = url.parse(req.url, true).query;

    if (req.url === '/') {
        fs.readFile('index.html', function(err, data){ 
            if(err) {throw err;}
            template({ content: data }, function(html){
                res.end(html);
            });
        });
    } else if (req.url === '/db') {
        db.query('select * from users where name = "' + params.name + '" LIMIT 1;', function(err, rows, field){
            fs.readFile('index.html', function(err, data){ 
                if(err) {throw err;}
                template({ content: data, rows: rows }, function(html){
                    res.end(html);
                });
            })
        })
    } else if (req.url === '/remote') {
        http.request(params, function(response){
            response.on('data', function(chunk){
                res.write(str);
            });
            response.on('end', function(){
                res.end();
            })
        });
    } else {
        fs.readFile(req.url, function(err, data){
            template({ content: data, input: params.input }, function(html){
                res.end(html);
            });
        });  
    }
}).listen(80);
console.log('Server running at http://127.0.0.1:80/');