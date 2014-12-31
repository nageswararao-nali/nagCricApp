var db = require('./db');
var notificationHelper = require('./notificationHelper');
var async = require('async');
// var scoreBoardHelp = require('./scoreBoardHelp');
var http = require('http');
var express = require('express');
var app = express();
var server = http.createServer(app)
var chat_room = require('socket.io')(server);
var redis = require('redis');
var client1 = redis.createClient();
server.listen(3004);
// app.use("views", express.static(__dirname + '/views'));
app.use("/scripts", express.static(__dirname + '/scripts/js'));
app.use("/images", express.static(__dirname + '/views/images'));
// app.use(session({secret : 'dsflkjdk34343'}));
app.engine("html",require('ejs').renderFile);
app.get("/sub/:chennel_name",function(req,res){
	res.render("index.html");
})
app.get("/",function(req,res){
	res.render("index.html");})
setTimeout(matchBefore30Mins,0)

setInterval(matchBefore30Mins,1800000)
function matchBefore30Mins(){
	// need to run every 30 mins
	notificationHelper.matchBefore30Mins();
}
// send match update notifications (Out info, scored 50,100)
setInterval(matchUpdates,10000)
function matchUpdates(){
	notificationHelper.matchUpdates();
}

// send match update notifications after match complete
setInterval(matchCompletionUpdates,10000)
function matchCompletionUpdates(){
	notificationHelper.matchCompletionUpdates();
}