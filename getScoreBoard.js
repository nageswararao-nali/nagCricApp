var request = require('request');
var cheer = require('cheerio');
var db = require('./db');
var yahooHelper = require('./yahooHelper');
var cricApi = require('./cricApi');
var async = require('async');
// var scoreBoardHelp = require('./scoreBoardHelp');
var noodle = require("noodlejs");
var http = require('http');
var express = require('express');
var app = express();
var server = http.createServer(app)
var chat_room = require('socket.io')(server);
var redis = require('redis');
var client1 = redis.createClient();
server.listen(3003);
app.use("views", express.static(__dirname + '/views'));
app.use("/scripts", express.static(__dirname + '/scripts/js'));
app.use("/images", express.static(__dirname + '/views/images'));
// app.use(session({secret : 'dsflkjdk34343'}));
app.engine("html",require('ejs').renderFile);
app.get("/sub/:chennel_name",function(req,res){
	res.render("index.html");
})
app.get("/",function(req,res){
	res.render("index.html");
})
chat_room.sockets.on("connection",function(socket){
	function updateScorecard(){
		cricApi.getLiveScorecard(function(match_full_info){
			// console.log(match_full_info[0])
			client1.set("scoreboard_data",JSON.stringify(match_full_info));
			socket.emit("scoreboard",match_full_info[0]);
			
		});
	}
	setInterval(updateScorecard,2000)
})

/*app.get("/",function(req,res){
	yahooHelper.getMatches()
})*/
app.get("/getUpcomingSeries",function(req,res){
	yahooHelper.getUpcomingSeriesMatches()
})
app.get("/getTeams",function(req,res){
	var teamIds = ["1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18","19","20","21","22","23","24","25","26"];
	yahooHelper.getTeamInfo(teamIds)
})
app.get("/getLatestMatchesSquad",function(req,res){
	yahooHelper.getSquadInfo()
})
app.get("/getPlayerOtherInfo",function(req,res){
	yahooHelper.getPlayerOtherInfo({});
	//console.log(html)
	// res.send(html)
})
app.get("/updatePlayerOtherInfo",function(req,res){
	yahooHelper.getPlayerOtherInfo({"otherInfo.cricPlayerUrl" : "http://www.espncricinfo.comundefined"});
})
app.get("/getPlayerStatInfo",function(req,res){

	yahooHelper.getPlayerStatInfo({});
})
app.get("/getMaidens",function(req,res){
	yahooHelper.getMaidens();
})
app.get("/updatePlayerStatInfo",function(req,res){

	yahooHelper.getPlayerStatInfo({fullname:{$exists:false}});
})


app.get("/getMatchUrl",function(req,res){
	yahooHelper.getMatchUrl({});
})

app.get("/getLiveScorecard",function(req,res){
	yahooHelper.getLiveScorecard();
})

app.get("/getNews",function(req,res){
	yahooHelper.getNews();
})

app.get("/getCommentary",function(req,res){
	yahooHelper.getCommentary();
})

//Sheduled Api calls

//get upcoming matches, upcoming series matches, update teams and get/update match squad
app.get("/getShedule",function(req,res){
	async.series([cricApi.getMatches(function(){}),cricApi.getUpcomingSeriesMatches(function(){
		cricApi.getSquadInfo(function(){ console.log("completed")})
	})],function(err,result){
		if(err)
			console.log("error in main call ====================================================" + err)
		else{
			console.log(" allllllllllllllllllllllllllllllllllllllllllllllllll completed")
			console.log(result)

		}
	})
})

// update player otherInfo
app.get("/getUpdatePlayerOtherInfo",function(req,res){
	cricApi.getPlayerOtherInfo({"otherInfo.cricPlayerUrl" : "http://www.espncricinfo.comundefined"});
	cricApi.getPlayerOtherInfo({"otherInfo.cricPlayerUrl" : "http://www.espncricinfo.com"});
	cricApi.getPlayerOtherInfo({"otherInfo.cricPlayerUrl" : {$exists : false}});
})

// get player stats and update maidens
app.get("/getPlayerStatInfoMaidens",function(req,res){
	cricApi.getPlayerStatInfo({});
})




