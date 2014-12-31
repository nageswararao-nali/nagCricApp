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
//server.listen(3002);
app.get("/",function(req,res){
	yahooHelper.getMatches()
})
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
//app.get("/getShedule",function(req,res){
	// setInterval(shedule,1800000)
//})

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
// setTimeout(shedule,1000)
// setInterval(shedule,1800000)
shedule()
function shedule(){
	console.log("in shedle")
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
}
// cricApi.getSquadInfo(function(){ console.log("completed")})
// getShedule()
function getShedule(){
	// client1.hdel("squad.189297.5",true,function(er,resu){console.log(er);console.log(resu)})
	/*client1.hgetall("squad.189297.5",function(er,resu){
						console.log(resu)
						for(var prop in resu){
							console.log(resu[prop])
							var ppp = JSON.parse(resu[prop])
							for(var prop1 in ppp){
								console.log(ppp[prop1])
							}
						}
					})*/
	client1.smembers("squad_189297_teams",function(er,re){
		console.log(re);
		for(var i=0;i<re.length;i++){
			var abc = re[i]
			client1.smembers("squad_189297_team"+re[i],function(er,re1){
				for(var j=0;j<re1.length;j++){
					client1.hgetall("squad.189297." + abc + "." + re1[j],function(er,resu){
						console.log(resu)
						/*for(var prop in resu){
							console.log(resu[prop])
							var ppp = JSON.parse(resu[prop])
							for(var prop1 in ppp){
								console.log(ppp[prop1])
							}
						}*/
					})
				}
			})
		}
	})
	// client1.hgetall("squad.189297",function(er,resu){
		/*if(err)
			console.log("err " + err)
		else{
			// var te = JSON.parse(resu);
			/*for(var prop in resu){
				console.log(resu[prop])
			}
			console.log(resu.teams)
			console.log(resu.teams.length)*/
			// for(var i=0;i<resu)
			// console.log(te)
			// console.log(JSON.parse(resu.teams))
			// for(var i=0;i<te.teams.length;i++)
			/*for(var prop in te.teams[0])
				console.log(prop)*/


		// }

	// })
}

