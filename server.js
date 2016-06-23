// Dependencies
var express = require('express');
var mongoose = require('mongoose');
var fs = require('fs')
var moment = require('moment')
var bcrypt = require('bcryptjs')
var flash = require('connect-flash')
var bodyParser = require('body-parser')
var http = require('http')
var nunjucks = require('nunjucks')
var expressSession = require('express-session')
require('html')

// App Setup
var app = express();
app.use(express.static(__dirname + '/views'));
app.use(express.static(__dirname + '/assets'));
app.use(express.static(__dirname + '/javascript'));
app.use(bodyParser.urlencoded({extended:true}));
app.use(expressSession({secret: 'mySecretKey'}))
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
app.use(flash())
nunjucks.configure('views', {
    autoescape: true,
    express: app
});
//app.engine('.html', require('nunjucks')._express);

//Sockets Setup
var server = http.createServer(app)
require('./routing/routes.js')(app)
require('./routing/api.js')(app)
require('./routing/adminroutes.js')(app)

// MongoDB Setup
mongoose.connect('mongodb://localhost:27017/judging')

// Main Init
var server = app.listen(3000 , function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Listening!');
});
