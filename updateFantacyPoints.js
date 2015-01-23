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
// server.listen(3004);
/*app.use("views", express.static(__dirname + '/views'));
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
			client1.set("redis_key","abcd");
			socket.emit("scoreboard",match_full_info[0]);
			
		});
	}
	setInterval(updateScorecard,10000)
})

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
*/


/*client1.get("scoreboard_data",function(err,reply){
	if(err)
		console.log(err)
	else{
		var match_full_info = JSON.parse(reply)
		console.log(match_full_info)
		for(var i=0;i<match_full_info.length;i++){
			console.log("in for")
			console.log(match_full_info[i])
			updateMatchFantasyPoints(match_full_info[i])
		}
		
	}
	
	// console.log(response)
	
})*/
/*client1.smembers("live_matches",function(er,liveMatches){
	if(er)
		console.log("error in getting live matches")
	else{
		console.log(liveMatches)
		var i=0,n=liveMatches.length;
		function matchLoop(i){
			console.log("in for")
			console.log(liveMatches[i])
			client1.get("match_day_" + liveMatches[i],function(err2,fPIndex){
				if(err2)
					console.log("error in getting findex")
				else{
					console.log("findex " + fPIndex)
					console.log("scoreboard_" + liveMatches[i] + "_day_" + fPIndex)
					client1.get("scoreboard_" + liveMatches[i] + "_day_" + fPIndex,function(err1,scoreboard){
						scoreboard = JSON.parse(scoreboard) 
						console.log(scoreboard)
						updateMatchFantasyPoints(scoreboard)
						i++;
						if(i != n)
							matchLoop(i)
					})
				}
			})
		}matchLoop(i)
	}
})*/
setInterval(getFP,3000)
getFP()
function getFP(){
	db.Match_Shedule.find({matchStatus:"running",local:{$exists:false}},{matchId:1},function(err,liveMatches){
		if(liveMatches.length){
			console.log(liveMatches)
			var i=0,n=liveMatches.length;
			function matchLoop(i){
				console.log("in for")
				console.log(liveMatches[i].matchId)
				client1.get("match_day_" + liveMatches[i].matchId,function(err2,fPIndex){
					if(err2)
						console.log("error in getting findex")
					else{
						console.log("findex " + fPIndex)
						console.log("scoreboard_" + liveMatches[i].matchId + "_day_" + fPIndex)
						client1.get("scoreboard_" + liveMatches[i].matchId + "_day_" + fPIndex,function(err1,scoreboard){
							scoreboard = JSON.parse(scoreboard) 
							// console.log(scoreboard)
							updateMatchFantasyPoints(scoreboard,function(){
								i++;
								if(i != n)
									matchLoop(i)
							})
						})
					}
				})
			}matchLoop(i)
		}
	})
}
function updateMatchFantasyPoints(match_score_info,callback){
	var matchId = match_score_info.matchId;
	console.log("match Id ==== " + matchId)
	var batting_info = match_score_info.batting_info;
	if(batting_info){
		var batsman_info = batting_info.batsman_info;
		var bowler_info = match_score_info.bowling_info.bowler_info;
		var batsman_comments = []
		db.Match_Shedule.findOne({matchId:matchId},{mtype:1,_id:0},function(matchDocerr,matchDoc){
				if(matchDocerr)
					console.log("error in getting match doc " + matchDocerr)
				else{
					if(matchDoc){
						var mtype = matchDoc.mtype;
						getfantasyIndex(batsman_info.length,matchId,function(fantasyIndex){
							if(fantasyIndex){
								//update batting player fantacy points
								// console.log("in first")
								var fantasyIndex = fantasyIndex;
								clearFantasyPoints(fantasyIndex,matchId,function(){
									getBatsmansFantasyPoints(batsman_info,matchId,fantasyIndex,mtype,function(batsman_comments){
										batsman_comments = batsman_comments;
										getBowlersFantasyPoints(bowler_info,matchId,fantasyIndex,mtype,function(){
											console.log(batsman_comments)
											updateBowlerFantasyPoints(batsman_comments,matchId,mtype,fantasyIndex,function(){
												console.log("batsman comment points updated")
												callback()
											})
											// console.log(" am in callback fun")
										})
									})
								})
								
							}
							
							
							//update bowler player fantacy points
							
						})
					}
				}
		})
		
	}else{
		console.log("batting info not available")
	}
	// client1.del("match_day_" + matchId)
	// client1.del("match_days_count_" + matchId)
	
}
var fIndex = 1;
function getfantasyIndex(batsmen_length,matchId,callback){
	client1.get("match_day_" + matchId,function(err,fIndex){
		if(err)
			console.log("redis get error " + err)
		else{
			if(fIndex)
				callback(fIndex)
			else
				callback(0)
		}
	})

}
function getfantasyIndex_old(batsmen_length,matchId,callback){
	console.log(batsmen_length)
	if(batsmen_length == 2){
		console.log("in if")
		client1.get("match_day_" + matchId,function(err,result){
			if(err)
				console.log("redis get error " + err)
			else{
				client1.get("match_days_count_" + matchId,function(err1,result1){
					if(err1)
						console.log("error in getting match days count ")
					else{
						console.log("result1 is " + result1)
						if(result1 === null || parseInt(result1) == 1){
							console.log("in result1 if ")
							client1.set("match_days_count_" + matchId,1)
							console.log( "result here is ------- " + result)
							if(result === null){
								console.log(" ***************************************** ")
								result = 1;
								client1.set("match_day_" + matchId,result)
							}
							callback(result);
						}else{
							console.log(result1)
							result = parseInt(result) + 1;
							client1.set("match_day_" + matchId,result)
							console.log(" in else ")
							client1.del("match_days_count_" + matchId)
							callback(result)
						}
					}
				})
				
			}
		})
	}
	else if(batsmen_length == 3){
		console.log("in g if")
		client1.get("match_days_count_" + matchId,function(err,result){
			var incr_id = "match_days_count_" + matchId;
			console.log(incr_id)
			result = parseInt(result) + 1; 
			client1.set("match_days_count_" + matchId,result)
			client1.get("match_day_" + matchId,function(err,mresult){
				if(err)
					console.log("redis get error " + err)
				else{
					callback(mresult)
				}
			})
		})
	}else{
		client1.get("match_day_" + matchId,function(err,mresult){
			if(err)
				console.log("redis get error " + err)
			else{
				callback(mresult)
			}
		})
	}
}
function clearFantasyPoints(fantasyIndex,matchId,callback){
	var players = [];
	client1.smembers("squad_" + matchId + "_teams",function(err,teams){
      	if(err){
      		console.log("error in getting squad teams " + err)
      	}
        else
        {
          	if(teams)
          	{
          		var i=0,ni = teams.length;
          		function teamsLoop(i){
          			client1.smembers("squad_" + matchId + "_team" + teams[i],function(err,playersList){
				      	if(err){
				      		console.log("error in getting squad players from teams " + err)
				      	}
				        else
				        {
				          	if(playersList)
				          	{
				          		clearFP(playersList,matchId,fantasyIndex,function(){
				          			i++;
				          			if(i != ni){
				          				teamsLoop(i)
				          			}
				          			if(i == ni){
				          				callback(players)
				          			}
				          		})
				          	}else{
				          		i++;
			          			if(i != ni){
			          				teamsLoop(i)
			          			}
			          			if(i == ni){
			          				callback(players)
			          			}
				          	}	
				          	
				      	}
				  	})
          		}
          		teamsLoop(i)
      		}else{
      			callback()
      		}
  		}
	})

}
function clearFP(players,matchId,fantasyIndex,callback){
	var i=0,n=players.length;
	var points = 0;
	function playerLoop(i){
		client1.set("fantasyPoints_" + matchId + "_" + players[i] + "_day_" + fantasyIndex,points)
		i++;
		if(i == n)
			callback()
		else
			playerLoop(i)
	}playerLoop(i)
}
function getBatsmansFantasyPoints(batsman_info,matchId,fantasyIndex,mtype,callback){
	var batsman_comments = [];
	var i=0,n=batsman_info.length;
	for(var j=0;j<batsman_info.length;j++){
			(function(j){
				var points = 0;
				
				var fp = {};
				// console.log("fantacy index for update ===================== " + fantasyIndex)
				
				/*db.Match_Shedule.findOne({matchId:matchId},{mtype:1,_id:0},function(matchDocerr,matchDoc){
					if(matchDocerr)
						console.log("error in getting match doc " + matchDocerr)
					else{
						if(matchDoc){*/
							/*for(var p in batsman_info[j].batsman_batting_info)
								console.log(p + "-------" + batsman_info[j].batsman_batting_info[p])*/
							battingfCal(batsman_info[j].batsman_batting_info,mtype,function(points){
								var fp = {};
								fp.day = "day_" + fantasyIndex;
								fp.points = points;
								// code to update fantasy points in mongo
								/*db.Player_Bid_Info.update({matchId:matchId,playerId:batsman_info[j].playerId,'fantasyPoints.$.day':"day_" + fantasyIndex},{$set:{'fantasyPoints.$.points':points}},function(err,res){
									if(err)
										console.log("error in updating fantacyPoints " + err)
									else{
										console.log(batsman_info[j].playerId + " ======== " + res)
										if(res == 0){
											db.Player_Bid_Info.update({matchId:matchId,playerId:batsman_info[j].playerId},{$addToSet:{fantasyPoints:fp}},function(err1,res1){})
										}
									}
								})*/
								// code to update fantasy points in redis
								console.log(batsman_info[j].playerId)
								client1.set("fantasyIndex_" + matchId,fantasyIndex)
								client1.set("fantasyPoints_" + matchId + "_" + batsman_info[j].playerId + "_day_" + fantasyIndex,points)
								batsman_comments.push(batsman_info[j].batsman_batting_info.Comment)
								i++;
								if(i == n)
									callback(batsman_comments)

							})
						/*}else{
							console.log("match not found")
						}
					}
					
				})*/
				
			})(j)
		}
}
function getBowlersFantasyPoints(bowler_info,matchId,fantasyIndex,mtype,callback){
	console.log("in bowler")
	var i=0;n=bowler_info.length;
	for(var j=0;j<bowler_info.length;j++){
			(function(j){
				var points = 0;
				
				var fp = {};
				// console.log("fantacy index for update ===================== " + fantasyIndex)
				
				/*db.Match_Shedule.findOne({matchId:matchId},{mtype:1,_id:0},function(matchDocerr,matchDoc){
					if(matchDocerr)
						console.log("error in getting match doc " + matchDocerr)
					else{*/
						bowlingfCal(bowler_info[j].bowler_bowling_info,mtype,function(points){
							var fp = {};
							fp.day = "day_" + fantasyIndex;
							fp.points = points;
							// code to store fantasy points in mongo
							/*db.Player_Bid_Info.update({matchId:matchId,playerId:bowler_info[j].playerId,'fantasyPoints.$.day':"day_" + fantasyIndex},{$set:{'fantasyPoints.$.points':points}},function(err,res){
								if(err)
									console.log("error in updating fantacyPoints " + err)
								else{
									console.log(bowler_info[j].playerId + " ======== " + res)
									if(res == 0){
										console.log("matchId : "+matchId+ " player : "+bowler_info[j].playerId + " fantasyPoints : "+ fp)
										console.log(fp)
										db.Player_Bid_Info.update({matchId:matchId,playerId:bowler_info[j].playerId},{$addToSet:{fantasyPoints:fp}},function(err1,res1){ 
											if(err1)
												console.log("error in add array ");
											console.log(bowler_info[j].playerId + "res1 ==== " + res1)
										})
									}else{
										console.log("res === " + res)
									}
								}
							})*/
							// code to store fantasy points in redis
							console.log(bowler_info[j].playerId + " === " + points)
							client1.set("fantasyIndex_" + matchId,fantasyIndex)
							client1.set("fantasyPoints_" + matchId + "_" + bowler_info[j].playerId + "_day_" + fantasyIndex,points)
							i++;
							if(i == n){
								console.log(" bowelr competed ")
								callback()
							}
						})
						
						
					/*}
					
				})*/
			})(j)
		}
}
function updateBowlerFantasyPoints(batsman_comments,matchId,mtype,fantasyIndex,callback){
	/*for(var i=0;i<batsman_comments.length;i++){
		evaluateComment(batsman_comments[i],matchId,mtype,fantasyIndex);
	}*/
	var i=0;
	// console.log(batsman_comments.length)
	function evaluateCommentF(i){
		if(batsman_comments[i]){
			evaluateComment(batsman_comments[i],matchId,mtype,fantasyIndex,function(){
				i++;
				console.log(i + " === " + batsman_comments.length)
				if(i >= batsman_comments.length)
					callback()
				else
					evaluateCommentF(i)
			});
		}else{
			i++;
			console.log(i + " === " + batsman_comments.length)
			if(i >= batsman_comments.length)
				callback()
			else
				evaluateCommentF(i)
		}
	}evaluateCommentF(i)
}
function evaluateComment(batsman_comment,matchId,mtype,fantasyIndex,callback){

	batsman_comment = batsman_comment.trim();
	console.log(" comment is === " + batsman_comment)
	if(batsman_comment !== "" && batsman_comment !== "not out"){
		var pts =0;
		if(batsman_comment[0] == "c"){
			console.log("in c if block ")
			if(batsman_comment.split(" ")[1] == "sub"){
				var bowler_name = batsman_comment.substring(parseInt(batsman_comment.indexOf("("))+1,parseInt(batsman_comment.indexOf(")"))).trim();
			}else{
				var bowler_name = batsman_comment.substring(1,batsman_comment.indexOf("b ")).trim();
			}
			if(bowler_name[0] == "†"){
				bowler_name = bowler_name.substring(1,bowler_name.length)
				pts = 4
			}else{
				pts = 6
			}
			console.log(bowler_name)
			updateBowlerPoints(bowler_name,matchId,fantasyIndex,pts,function(){
				console.log("in updation --")
				callback()
			})
			
		}else if(batsman_comment[0] == "b"){
			console.log(" in b if block ")
			var bowler_name = batsman_comment.substring(1,batsman_comment.length).trim();
			if(mtype == "odi") 
				pts = 15
			else if(mtype == "test")
				pts = 20
			else if(mtype == "twenty20" || mtype == "t20")
				pts = 10
			updateBowlerPoints(bowler_name,matchId,fantasyIndex,pts,function(){
				callback();
			})
		}else if(batsman_comment.indexOf("run out") > -1){
			var bowler_names = batsman_comment.substring(parseInt(batsman_comment.indexOf("("))+1,parseInt(batsman_comment.indexOf(")"))).trim();
			var bowler_names_array = bowler_names.split("/");
			if(bowler_names_array.length >2)
				pts = 2
			else if(bowler_names_array.length >1)
				pts = 3
			else
				pts = 6
			var k=0,nk=bowler_names_array.length;
			for(var j=0;j<bowler_names_array.length;j++){
				updateBowlerPoints(bowler_names_array[j],matchId,fantasyIndex,pts,function(){
					k++;
					if(k == nk)
						callback();
				})
			}
				
		}else if(batsman_comment[0] == "st"){
			var bowler_name = batsman_comment.substring(1,batsman_comment.indexOf("b ")).trim();
			if(bowler_name[0] == "†"){
				bowler_name = bowler_name.substring(1,bowler_name.length)
				pts = 5
				updateBowlerPoints(bowler_name,matchId,fantasyIndex,pts,function(){
					callback()
				})
			}else{
				callback()
			}
		}else{
			callback();
		}
	}else{
		callback()
	}
}
function updateBowlerPoints(bowler_name,matchId,fantasyIndex,pts,callback){
	getBowlerId(bowler_name,matchId,function(bowlerId){
		if(bowlerId != 0){
			updatePoints(bowlerId,matchId,fantasyIndex,pts,function(pots){
				console.log("player " + bowlerId + " fantasy points updated")
				console.log(bowlerId + " === " + pots)
				callback();
			})
		}else{
			callback()
		}
	})
}
function updatePoints(bowlerId,matchId,fantasyIndex,pts,cback){
	client1.get("fantasyPoints_" + matchId + "_" + bowlerId + "_day_" + fantasyIndex,function(err1,result1){
		if(err1)
			console.log("error in getting player fantasy points " + err1)
		else{
			if(result1 === null){
				client1.set("fantasyPoints_" + matchId + "_" + bowlerId + "_day_" + fantasyIndex,pts)
				cback(pts)
			}else{
				pts += parseInt(result1)
				client1.set("fantasyPoints_" + matchId + "_" + bowlerId + "_day_" + fantasyIndex,pts)
				cback(pts)
			}
		}
	})
}
function getBowlerId(bowler_name,matchId,callback){
	client1.smembers("squad_" + matchId + "_teams",function(er,re){
		if(er)
			console.log("error in getting team info " + er)
		else{
			// console.log(re);
			var i1=0;ni=re.length;
			function reLoop(i1){
				var abc = re[i1];
				client1.smembers("squad_" + matchId + "_team"+re[i1],function(er,re1){
					var j1=0;nj=re1.length;
					i1++;
					function re1Loop(j1){
						console.log("squad." + matchId + "." + abc + "." + re1[j1])
						client1.hgetall("squad." + matchId + "." + abc + "." + re1[j1],function(er,resu){

							j1++;
							console.log(" playerId is  " + resu.playerId)
							if(resu.playerName.indexOf(bowler_name) > -1){
								var bowlerId = resu.playerId;
								callback(bowlerId)
							}else if(j1 >= nj){
								if(i1 >= ni)
									callback(0)
								else
									reLoop(i1)
							}else{
								re1Loop(j1)
							}
						})
					}re1Loop(j1);
				})
			}reLoop(i1)
		}
		
	})
}
function battingfCal(batsman_obj,mtype,callback){
	var points = 0;
	points = parseInt(points);
	var runs = parseInt(batsman_obj.Runs)
	var fours = parseInt(batsman_obj.fours)
	var sixes = parseInt(batsman_obj.sixes)
	var balls = parseInt(batsman_obj.Balls)
	var strinkeRate = parseInt(batsman_obj.StrinkeRate)
	if(mtype == "odi"){
		points += runs;
		points += (fours * 1);
		points += (sixes * 2);
		if(runs >= 250){
			var rr = (runs-200)%50;
			points += (rr * 10);  
			points += 25;  
		}else if(runs >= 200){
			points += 25; 
		}else if(runs >= 150){
			points += 15; 
		}else if(runs >= 100){
			points += 10; 
		}else if(runs >= 50){
			points += 4; 
		}
		if(balls <= 1 ){
			points += 20; 
		}else if(runs <= 0 ){
			points += 10; 
		}
		if(balls >= 25 ){
			points += 10; 
			if(strinkeRate >= 200) 
				points += 25
			else if(strinkeRate >= 175) 
				points += 20
			else if(strinkeRate >= 150) 
				points += 15
			else if(strinkeRate >= 125)
				points += 10
			else if(strinkeRate >= 100) 
				points += 3
			else if(strinkeRate >= 75)
				points += 3
			else if(strinkeRate < 50)
				points -= 5
		}
		console.log("points is ====== " + points)
		callback(points)
	}else if(mtype == "test"){
		points += runs;
		points += (fours*1);
		points += (sixes*2);
		if(runs >= 250){
			var rr = (runs-200)%50;
			points += (rr * 5);  
			points += 10;  
		}else if(runs >= 200){
			points += 10; 
		}else if(runs >= 150){
			points += 8; 
		}else if(runs >= 100){
			points += 5; 
		}else if(runs >= 50){
			points += 2; 
		}
		if(balls <= 1 ){
			points -= 30; 
		}else if(runs <= 0 ){
			points -= 20; 
		}
		if(balls >= 50 ){
			points += 5; 
			if(strinkeRate >= 200) 
				points += 50
			else if(strinkeRate >= 175) 
				points += 30
			else if(strinkeRate >= 150) 
				points += 25
			else if(strinkeRate >= 125)
				points += 20
			else if(strinkeRate >= 100) 
				points += 15
			else if(strinkeRate >= 75)
				points += 10
			else if(strinkeRate >= 50)
				points += 5
		}
		console.log("points is ====== " + points)
		callback(points)

	}else if(mtype == "twenty20" || mtype == "t20"){
		points += runs;
		points += (fours*1);
		points += (sixes*6);
		if(runs >= 250){
			var rr = (runs-200)%50;
			points += (rr * 25);  
			points += 50;  
		}else if(runs >= 200){
			points += 50; 
		}else if(runs >= 150){
			points += 30; 
		}else if(runs >= 100){
			points += 20; 
		}else if(runs >= 50){
			points += 6; 
		}
		if(balls <= 1 ){
			points -= 15; 
		}else if(runs <= 0 ){
			points -= 5; 
		}
		if(balls >= 10 ){
			points += 15; 
			if(strinkeRate >= 200) 
				points += 20
			else if(strinkeRate >= 175) 
				points += 15
			else if(strinkeRate >= 150) 
				points += 10
			else if(strinkeRate >= 125)
				points += 5
			else if(strinkeRate >= 100) 
				points += 0
			else if(strinkeRate >= 75)
				points -= 5
			else if(strinkeRate >= 50)
				points -= 15
			else if(strinkeRate >= 50)
				points -= 20
		}
		console.log("points is ====== " + points)
		callback(points)

	}
}
function bowlingfCal(bowler_obj,mtype,callback){
	var points = 0;
	points = parseInt(points);
	var maidens = parseInt(bowler_obj.Maidens)
	var wickets = parseInt(bowler_obj.Wickets)
	var econemyRates = parseInt(bowler_obj.EconemyRates)
	var overs = parseInt(bowler_obj.Overs)
	if(mtype == "odi"){
		points += (maidens*5);
		points += (wickets*15);
		if(wickets > 5){
			var rw = wickets-5
			points += (rw*10);
			points += 25;
		}else if(wickets == 5){
			points += 25;
		}else if(wickets == 4){
			points += 10;
		}else if(wickets == 3){
			points += 5;
		}
		if(overs >= 4){
			if(econemyRates >= 10) 
				points -= 30
			else if(econemyRates >= 9) 
				points -= 20
			else if(econemyRates >= 8) 
				points -= 10
			else if(econemyRates == 6) 
				points -= 5
			else if(econemyRates >= 5) 
				points += 0
			else if(econemyRates >= 4) 
				points += 5
			else if(econemyRates >= 3) 
				points += 15
			else if(econemyRates < 1) 
				points += 50
			else if(econemyRates >= 3) 
				points += 30
		}
		console.log("points is ====== " + points)
		callback(points)
	}else if(mtype == "test"){
		points += (maidens*1);
		points += (wickets*25);

		if(wickets > 5){
			var rw = wickets-5
			points += (rw*5);
			points += 10;
		}else if(wickets == 5){
			points += 10;
		}else if(wickets == 4){
			points += 5;
		}else if(wickets == 3){
			points += 0;
		}
		if(overs >= 20 ){
			if(econemyRates >= 10) 
				points -= 50
			else if(econemyRates >= 9) 
				points -= 30
			else if(econemyRates >= 8) 
				points -= 25
			else if(econemyRates == 6) 
				points -= 20
			else if(econemyRates >= 5) 
				points -= 15
			else if(econemyRates >= 4) 
				points -= 10
			else if(econemyRates >= 3) 
				points -= 5
			else if(econemyRates < 1) 
				points += 10
			else if(econemyRates >= 3) 
				points += 5
		}
		console.log("bowling points is ====== " + points)
		callback(points)

	}else if(mtype == "twenty20" || mtype == "t20"){
		points += (maidens*10);
		points += (wickets*10);
		if(wickets > 5){
			var rw = wickets-5
			points += (rw*20);
			points += 50;
		}else if(wickets == 5){
			points += 50;
		}else if(wickets == 4){
			points += 20;
		}else if(wickets == 3){
			points += 10;
		}
		if(overs >= 20 ){
			if(econemyRates >= 10) 
				points -= 20
			else if(econemyRates >= 9) 
				points -= 10
			else if(econemyRates >= 8) 
				points -= 5
			else if(econemyRates == 6) 
				points += 0
			else if(econemyRates >= 5) 
				points += 10
			else if(econemyRates >= 4) 
				points += 20
			else if(econemyRates >= 3) 
				points += 50
			else if(econemyRates < 1) 
				points += 100
			else if(econemyRates >= 3) 
				points += 75
		}
		console.log("points is ====== " + points)
		callback(points)

	}
}