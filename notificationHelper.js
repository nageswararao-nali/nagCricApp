var db = require('./db');
var request = require('request');
var redis = require('redis');
var client1 = redis.createClient();
var Leaderboard = require('leaderboard');

exports.matchBefore30Mins = function(){
	var newDate = new Date();
	// newDate = newDate.toISOString()
	console.log(newDate)
	db.Match_Shedule.find({StartDate:{$gte:newDate},local:{$exists:false}},{StartDate:1,"team1.teamName":1,"team2.teamName":1,matchId:1},function(err1,matches){
		if(err1){
			console.log("error in getting matches " + err1)
		}else{
			if(matches){
				var j=0,n=matches.length;
				console.log(n)
				function matchLoop(j){
					var notificationMessage = "";
					console.log(matches[j].StartDate-newDate + " ----- " + matches[j].matchId)
					if(parseInt(matches[j].StartDate-newDate) <= 0 && parseInt(matches[j].StartDate-newDate) > -30){
						console.log("matche started message")
						notificationMessage = matches[j].team1.teamName + " Vs " + matches[j].team2.teamName + " match has started. Get ready to play with your frineds";
						sendMatchBefore30MinNotification(notificationMessage,function(){
							j++;
							if(j != n){
								var msg = "Create a league for the " + matches[j].team1.teamName + " Vs " + matches[j].team2.teamName + " match and have fun with your friends";
								sendCreateLeagueNotificationForFollowers(msg,matches[j].matchId,function(){
									matchLoop(j)
								})
							}
						})
						sendPendingPlayerUpdationNotification(matches[j].matchId);
					}else if(parseInt(matches[j].StartDate-newDate) <= 1800000 && parseInt(matches[j].StartDate-newDate) > 0){
						console.log("matche before start message")
						notificationMessage = matches[j].team1.teamName + " Vs " + matches[j].team2.teamName + " match is strating in 30 Mins. Get ready to play with your friends";
						notificationMessage1 = "For " + matches[j].team1.teamName + " Vs " + matches[j].team2.teamName + " match, playerName is not in squad. Please update your team";
						updateMatchFinalSquad(notificationMessage1,matches[j].matchId);
						sendMatchBefore30MinNotification(notificationMessage,function(){
							j++;
							if(j != n)
								matchLoop(j)
						})

					}else{
						console.log("match not yet started")
						j++;
						if(j != n)
							matchLoop(j)
					}
				}
				matchLoop(j)
			}else{
				console.log("no mathces found")
			}
			
		}
	})
	
	/*db.userSchema.find({},{_id:1},function(err,docs){
		if(err){
			console.log("error in getting users " + err)
		}else{
			if(docs){
				console.log(docs.length)
				for(var i=0;i<docs.length;i++){
					console.log(docs[i]._id)
				}
			}else{
				console.log(" no users found ")
			}
		}
	})*/
}
function sendMatchBefore30MinNotification(notificationMessage,callback){
	db.userSchema.find({},{_id:1},function(err,docs){
		if(err){
			console.log("error in getting users " + err)
		}else{
			if(docs){
				console.log(docs.length)
				var j=0,nj=docs.length;
				for(var i=0;i<docs.length;i++){
					console.log(docs[i]._id)
					sendNotification(notificationMessage,docs[i]._id,function(){
						j++;
						if(j == nj){
							callback()
						}
					})
				}
			}else{
				console.log(" no users found ")
			}
		}
	})
}
function sendCreateLeagueNotificationForFollowers(notificationMessage,matchId,callback){
	db.matchFollowers.find({matchId:matchId},{_id:1},function(err,users){
		if(err){
			console.log("error in getting users " + err)
		}else{
			if(users){
				console.log(users.length)
				var j=0,nj=users.length;
				for(var i=0;i<users.length;i++){
					db.LeaguesInfo.find({matchId:matchId,users:users[i]._id},function(err1,league){
						if(err1){
							console.log("error in getting league info for user " + err1)
						}else{
							if(league.length <=1){
								console.log(users[i]._id)
								sendNotification(notificationMessage,users[i]._id,function(){
									j++;
									if(j == nj){
										callback()
									}
								})
							}else{
								j++;
								if(j == nj){
									callback()
								}
							}
						}
					})
					
				}
			}else{
				console.log(" no users found ")
			}
		}
	})
}
exports.matchUpdates = function(){
	client1.get("scoreboard_data",function(err,reply){
		if(err)
			console.log(err)
		else{
			var match_full_info = JSON.parse(reply)
			console.log(match_full_info)
			for(var i=0;i<match_full_info.length;i++){
				console.log("in for")
				console.log(match_full_info[i])
				sendMatchInfo(match_full_info[i],function(){
					console.log("sent match updates")
				})
			}
		}
	})
}
function sendMatchInfo(match_info,callback){
	var matchId = match_score_info.matchId;
	console.log("match Id ==== " + matchId)
	var batsman_info = match_score_info.batting_info.batsman_info;
	var bowler_info = match_score_info.bowling_info.bowler_info;
	var batsman_comments = [];
	var i=0,n=batsman_info.length;
	for(var j=0;j<batsman_info.length;j++){
		(function(j){
			var playerId = batsman_info[j].playerId;
			var playerName = batsman_info[j].playerName;
			var comment = parseInt(batsman_info[j].batsman_batting_info.Comment)
			var runs = parseInt(batsman_info[j].batsman_batting_info.Runs)
			var fours = parseInt(batsman_info[j].batsman_batting_info.fours)
			var sixes = parseInt(batsman_info[j].batsman_batting_info.sixes)
			var balls = parseInt(batsman_info[j].batsman_batting_info.Balls)
			var strinkeRate = parseInt(batsman_info[j].batsman_batting_info.StrinkeRate)
			if(comment != "not out"){
				// check and send player out info
				client1.get("matchUpdates_" + matchId + "_" + playerId + "_out"  ,function(err1,result1){
					if(err1)
						console.log("error in getting match out info ")
					else{
						if(result1 === null){
							sendPlayerOutInfo(matchId,playerId,playerName,function(){
								client1.set("matchUpdates_" + matchId + "_" + playerId + "_out" ,1)
								// send runs info starts 
								sendPlayerRunsInfo(matchId,playerId,playerName,runs,function(){
									console.log("send notification for out player")
									i++;
									if(i == n)
										callback()
								})
								// send runs info ends
							})
						}
					}
				})
			}else{
				// send runs info starts
				sendPlayerRunsInfo(matchId,playerId,playerName,runs,function(){
					console.log("send notification for not out player")
					i++;
					if(i == n)
						callback()
				})
				// send runs info starts
			}
		})(j)
	}
}
function sendPlayerOutInfo(matchId,playerId,playerName,callback){
	db.Player_Bid_Info.findOne({matchId:matchId,playerId:playerId},{bidInfo:1},function(bidUseEerr,bidUsers){
		if(bidUseEerr){
			console.log("error in getting bid users")
		}else{
			if(bidUsers){
				var j = 0,nj = bidUsers.length;
				for(var x=0;x<bidUsers.length;x++){
					(function(x){
						var notificationMessage = "Oh no. " + playerName + " is out";
						sendNotification(notificationMessage,bidUsers[x].FBID,function(){
							j++;
							if(j == nj){
								callback()
							}
						})
					})(x)
				}
			}
		}
	})
}
function sendPlayerRunsInfo(matchId,playerId,playerName,runs,callback){
	db.Player_Bid_Info.findOne({matchId:matchId,playerId:playerId},{bidInfo:1},function(bidUseEerr,bidUsers){
		if(bidUseEerr){
			console.log("error in getting bid users")
		}else{
			if(bidUsers){
				var j = 0,nj = bidUsers.length;
				for(var x=0;x<bidUsers.length;x++){
					(function(x){
						var runsCrossed = (runs % 50) * 50;
						var userId = bidUsers[x].FBID;
						var notificationMessage =  "";
						if(runsCrossed == 100)
							notificationMessage = "Good news. " + playerName + " has made " + runsCrossed + " runs.";
						else if(runsCrossed == 100)
							notificationMessage = "Great news. " + playerName + " has hit a century.";
						else
							notificationMessage = "Great news. " + playerName + " has hit " + runsCrossed + " runs.";
						client1.get("matchUpdates_" + matchId + "_" + playerId + "_runs_" + runsCrossed  ,function(err1,result1){
							if(err1)
								console.log("error in getting match out info ")
							else{
								if(result1 === null){
									sendNotification(notificationMessage,userId,function(){
										j++;
										if(j == nj){
											callback()
										}
									})
								}else{
									j++;
									if(j == nj){
										callback()
									}
								}
							}
						})
					})(x)
				}
			}
		}
	})
}

exports.matchCompletionUpdates = function(){
	db.Match_Shedule.find({matchStatus:"running",local:{$exists:false}},{matchId:1,"otherInfo.cricmatchUrl":1,team1:1,team2:1,StartDate:1,EndDate:1},function(matchErr,docs){
		if(matchErr){
			console.log("error in getting match from match shedule " + matchErr)
		}else{
			console.log(docs.length)
			if(docs.length){
				var i=0,n=docs.length;
				function matchLoop(i){
					var match_url = docs[i].otherInfo.cricmatchUrl;
					// callback()
					checkMatchFinished(docs[i].matchId,function(isFinished){
						console.log("match id is == " +docs[i].matchId)
						console.log("isFinished == " + isFinished)
						if(isFinished){
							console.log("in if -- match finished")
							getMatchFantasyPointsUpdates(docs[i].matchId,function(){
								console.log("in h1")
								var playerWisePoints = {};
								updateFantasyPointsNotification(docs[i].matchId,function(playerWisePoints){
									console.log("in h2")
									sendFantasyPointsNotificationToUsers(playerWisePoints,docs[i].matchId,function(){
										console.log("in h3")
										sendLeaderboardNotification(docs[i].matchId)
										client1.srem("live_mathces",docs[i].matchId);
										db.Match_Shedule.update({matchId:docs[i].matchId},{matchStatus:"completed"},function(er,upd){
											if(er)
												console.log("error in updating match completion" + er)
											else{
												console.log(upd)
												i++;
												if(i != n)
													matchLoop(i)
											}
										})
										// ic++;
									})
								})
							})
						}else{
							console.log("in else match not finished by yahoo")
							getMatchUrls(match_url,function(full_score_url){
								console.log("full score url find == " + full_score_url)
								if(full_score_url == 1){
									console.log("in if cric ")
									getMatchFantasyPointsUpdates(docs[i].matchId,function(){
										var playerWisePoints = {};
										updateFantasyPointsNotification(docs[i].matchId,function(playerWisePoints){
											sendFantasyPointsNotificationToUsers(playerWisePoints,docs[i].matchId,function(){
												sendLeaderboardNotification(docs[i].matchId)
												client.srem("live_mathces",docs[i].matchId);
												db.Match_Shedule.update({matchId:docs[i].matchId},{matchStatus:"completed"},function(er,upd){
													if(er)
														console.log("error in updating match completion" + er)
													else{
														console.log(upd)
														i++;
														if(i != n)
															matchLoop(i)
													}
												})
												// ic++;
											})
										})
									})
								}else{
									console.log("in else cric")
									getMatchComment(full_score_url,function(matchComment){
										if(matchComment.indexOf("won by") > -1 || matchComment.indexOf("match drawn") > -1 || matchComment.indexOf("match tied") > -1){
											getMatchFantasyPointsUpdates(docs[i].matchId,function(){
												var playerWisePoints = {};
												updateFantasyPointsNotification(match,function(playerWisePoints){
													sendFantasyPointsNotificationToUsers(playerWisePoints,matches[i],function(){
														sendLeaderboardNotification(matches[i])
														client.srem("live_mathces",match);
														db.Match_Shedule.update({matchId:docs[i].matchId},{matchStatus:"completed"},function(er,upd){
															if(er)
																console.log("error in updating match completion" + er)
															else{
																console.log(upd)
																i++;
																if(i != n)
																	matchLoop(i)
															}
														})
														// ic++;
													})
												})
											})
										}else if(matchComment.indexOf("match cancelled") > -1 || matchComment.indexOf("match abandoned") > -1){
											console.log("match cancelled")
										}
									})
								}
							})
						}
					})
					
					
				}matchLoop(i)
				
			}
		}
	})
		
}
exports.matchCompletionUpdates_old = function(){
	client1.smembers("live_mathces",function(err,matches){
		if(err){
			console.log("error in getting live matches from redis set")
		}else{
			var ic=0;nic=matches.length;
			for(var i=0;i<matches.length;i++){
				(function(i){
					db.Match_Shedule.find({matchId:matches[i]},{matchId:1,"otherInfo.cricmatchUrl":1,team1:1,team2:1,StartDate:1,EndDate:1},function(matchErr,docs){
						if(matchErr){
							console.log("error in getting match from match shedule " + matchErr)
						}else{
							if(docs){
								var match_url = match.otherInfo.cricmatchUrl;
								// callback()
								checkMatchFinished(matches[i],function(isFinished){
									if(isFinished){
										getMatchFantasyPointsUpdates(matches[i],function(){
											var playerWisePoints = {};
											updateFantasyPointsNotification(match,function(playerWisePoints){
												sendFantasyPointsNotificationToUsers(playerWisePoints,matches[i],function(){
													sendLeaderboardNotification(matches[i])
													client.srem("live_mathces",match);
													// ic++;
												})
											})
										})
									}else{
										getMatchUrls(match_url,function(full_score_url){
											if(full_score_url == 1){
												getMatchFantasyPointsUpdates(matches[i],function(){
													var playerWisePoints = {};
													updateFantasyPointsNotification(match,function(playerWisePoints){
														sendFantasyPointsNotificationToUsers(playerWisePoints,matches[i],function(){
															sendLeaderboardNotification(matches[i])
															client.srem("live_mathces",match);
															// ic++;
														})
													})
												})
											}else{
												getMatchComment(full_score_url,function(matchComment){
													if(matchComment.indexOf("won by") > -1 || matchComment.indexOf("match drawn") > -1 || matchComment.indexOf("match tied") > -1){
														getMatchFantasyPointsUpdates(matches[i],function(){
															var playerWisePoints = {};
															updateFantasyPointsNotification(match,function(playerWisePoints){
																sendFantasyPointsNotificationToUsers(playerWisePoints,matches[i],function(){
																	sendLeaderboardNotification(matches[i])
																	client.srem("live_mathces",match);
																	// ic++;
																})
															})
														})
													}else if(matchComment.indexOf("match cancelled") > -1 || matchComment.indexOf("match abandoned") > -1){
														console.log("match cancelled")
													}
												})
											}
										})
									}
								})
							}
						}
					})
				})(i)
			}
		}
	})
}
function getMatchComment(url,callback){
	request(full_score_url,function(err, resp, matchContent){
		$ = cheer.load(matchContent);
		var matchComment = $(".innings-requirement").text().trim();
		callback(matchComment);
	})
}
// get match cricinfo scoreboard urls for match 
function getMatchUrls(match_url,callback){
	request(match_url,function(err, resp, matchContent){
		$ = cheer.load(matchContent);
		var full_score = $(".tabs-block li").eq(1).attr("data-url"); 
		if(full_score == "" || full_score === undefined){
			callback(1)
			/*var playerWisePoints = {};
			updateFantasyPointsNotification(match,function(playerWisePoints){
				sendFantasyPointsNotificationToUsers(playerWisePoints,match,function(){
					client.srem("live_mathces",match);
				})
			})*/
		}else{
			callback(full_score)
		}
	})
}
// update man of the match fantasy points after match complete
function getMatchFantasyPointsUpdates(matchId,callback){
	var mtype = "",pts = 0,mom_obj = {};
	var upcoming_matches_url = "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20cricket.scorecard.summary%20where%20match_id%3D" + matchId + "&format=json&diagnostics=true&env=store%3A%2F%2F0TxIGQMQbObzvU4Apia0V0&callback="
	request(upcoming_matches_url,function(err, resp, matchContent){
		var matches_object = JSON.parse(matchContent);
		// code to update man of the match
		var mom_id = matches_object.query.results.Scorecard.result.mom.i;
		db.Match_Shedule.findOne({matchId:matchId},{mtype:1},function(err1,match){
			if(err1){
				console.log("error in getting matches " + err1)
			}else{
				if(match){
					if(match.mtype == "odi") 
						pts = 50
					else if(match.mtype == "test")
						pts = 100
					else if(match.mtype == "twenty20" || mtype == "t20")
						pts = 25
					mom_obj.playerId = mom_id;
					mom_obj.points = pts;
					// client1.hmset("fantasyPoints_" + matchId + "_mom",mom_obj)
					client1.set("fantasyPoints_" + matchId + "_" + mom_id + "_mom",pts);
					callback()
				}else{
					callback()
				}
			} 
		})
		// code for update man of the series
		/*var mos_id = matches_object.query.results.Scorecard.result.mos.i;
		if(mtype == "odi") 
			pts = 300
		else if(mtype == "test")
			pts = 500
		else if(mtype == "twenty20" || mtype == "t20")
			pts = 200
		client1.set("fantasyPoints_" + matchId + "_" + mos_id + "_mos",pts)*/
	})
}
function updateFantasyPointsNotification(match,callback){
	var matchId = match;
	var playerWisePoints = {};
	playerWisePoints["matchId_" + match] = {};
	db.Player_Bid_Info.find({matchId:matchId},function(bidUseEerr,bidplayers){
		if(bidUseEerr){
			console.log("error in getting bid users")
		}else{
			if(bidplayers.length){
				client1.get("match_day_" + matchId,function(err,mresult){
					if(err)
						console.log("redis get error " + err)
					else{
						var ic = 0,nic = bidplayers.length;
						var fantasyIndex = mresult;
						for(var i=0;i<bidplayers.length;i++){
							(function(i){
								var playerId = bidplayers[i].playerId;
								calFantasyPoints(matchId,playerId,fantasyIndex,function(pts){
									playerWisePoints["matchId_" + matchId]["playerId_" + playerId] = pts;
									console.log(ic + " ==== " + nic)
									ic++
									if(ic == nic)
										callback(playerWisePoints["matchId_" + matchId])
								})
							})(i)
						}
					}
				})
			}else{
				callback(playerWisePoints["matchId_" + matchId])
			}
		}
	})
}
// caliculate fatasy points for player 
function calFantasyPoints(matchId,playerId,fantasyIndex,callback){
	var fic = 0,nfic = fantasyIndex,pts=0;
	for(var fi=fantasyIndex;fi>=0;fi--){
		(function(fi){
			client1.get("fantasyPoints_" + matchId + "_" + playerId + "_day_" + fantasyIndex,function(er,points){
				if(points){
					pts += points;
				}
				nfic--;
				if(fic == nfic)
					callback(pts)
			})
		})(fi)
	}
}
// send total fantasy points to users 
function sendFantasyPointsNotificationToUsers(playerWisePoints,matchId,callback){
	console.dir("points are " + playerWisePoints)
	db.userSchema.find({},{_id:1},function(err,users){
		if(err){
			console.log("error in getting users " + err)
		}else{
			if(users.length){
				console.log("in if users")
				var nag = new Leaderboard('matchLeaderboard' + matchId, {}, client1)
				var ic =0, nic=users.length;
				for(var i=0;i<users.length;i++){
					(function(i){
						db.Player_Bid_Info.find({matchId:matchId,"bidInfo.FBID":users[i]._id},{playerId:1},function(bidUseEerr,bidplayers){
							if(bidUseEerr){
								console.log("error in getting bid users")
							}else{
								if(bidplayers.length){
									console.log("in if bid players")
									getTotalPoints(matchId,bidplayers,playerWisePoints,function(points){
										console.log("bid calback")
										var notification = {};
										db.Match_Shedule.findOne({matchId:matchId},{StartDate:1,"team1.teamName":1,"team2.teamName":1,matchId:1},function(err1,matches){
											if(err1){
												console.log("error in getting matches " + err1)
											}else{
												if(matches){
													// converted points to credits (0.5 ratio)
													var credits = points*0.5;
													var notificationMessage =  "Congratulations! You have earned " + points + " fantasy points and earned " + credits + " credits from the " + matches.team1.teamName + " v " + matches.team2.teamName + " match.";
													nag.add(users[i]._id,points,function(err){
														if(err)
															console.log(err)
													})
													console.log(" in matches")
													findLeagueLeaderboard(matchId,users[i]._id,points,function(){
														sendNotification(notificationMessage,users[i]._id,function(){
															updateCredits(users[i]._id,credits,function(){
																ic++
																if(ic == nic)
																	callback()
															})
														})
													})
												}else{
													ic++
													if(ic == nic)
														callback()
												}
											} 
										})
									})
								}else{
									ic++
									if(ic == nic)
										callback()
								}
							} 
						})
					})(i)
				}
			}else{
				console.log("in else users")
				callback()
			}
		}
	})
}
// caliculate total fantasy points for user
function getTotalPoints(matchId,bidplayers,playerWisePoints,callback){
	console.log(" here " + bidplayers)
	console.log(playerWisePoints)
	var points = 0;
	var bpc=0,nbpc = bidplayers.length;
	console.log(nbpc)
	for(var bp=0;bp<bidplayers.length;bp++){
		points += playerWisePoints["playerId_" + bidplayers[bpc].playerId]
		client1.get("fantasyPoints_" + matchId + "_" + bidplayers.playerId + "_mom",function(err,pts){
			if(pts !== null){
				points += pts;
				bpc++;
				console.log(bpc + " == " + nbpc)
				if(bpc == nbpc)
					callback(points)
			}else{
				bpc++;
				console.log(bpc + " == " + nbpc)
				if(bpc == nbpc)
					callback(points)
			}
		})
	}
}
function updateCredits(userId,credits,callback){
	db.userSchema.update({_id:userId},{$inc:{Credits:credits}},function(err,result){
		if(err){
			console.log("error in credits updation " + err)
		}else{
			console.log("credits updated")
			callback()
		}
	})
}
function sendPendingPlayerUpdationNotification(matchId){
	redis.smembers("bidarray"+matchId+"_"+playerId+"",function(err,members){
      	if(err){
      		console.log("error in getting pending bid info users list from redis " + err)
      	}
        else
        {
          	if(members)
          	{
          		var i=0,n = members.length;
          		function pendingUsers(i){
          			member = JSON.parse(members[x]);
          			sendPendingPlayerAlertNotification(member.FBID,function(){
          				i++;
	          			if(i != n)
	          				pendingUsers(i)
          			})
          		}
          		pendingUsers(i);
          	}
        }
 	});
}
function sendPendingPlayerAlertNotification(userId,callback){
	var notificationMessage = "You don't have a complete team. Edit your bids to form a full team.";
	sendNotification(notificationMessage,userId,function(){
		callback()
	})
}
function sendNotification(notificationMessage,userId,callback){
  var notification = {};
  notification.user = userId;
  notification.message = notificationMessage;
  notification.createDate = new Date();
  console.log(notification)
  var notifications = new db.Notifications(notification);
  notifications.save(function(err,recs){
    if(err){
      console.log("error in saving notification " + err)
    }else{
      console.log("save notification ")
      callback()
    }
  })
}
function findLeagueLeaderboard(matchId,userId,points,callback){
	db.LeaguesInfo.find({matchId:matchId,users:userId,leagueName:{$ne:{$regex:"piblicLeague"}}},{leagueName:1,_id:1},function(err,league){
	    if(err){
	      console.log("error in getting leagues getFriendLeagueStatus " + err)
	    }else{
	      if(league.length){
	        var i=0,n=league.length;
	        function leagueLoop(i){
	    		console.log("league Name is :" + league[i]._id);
	    		var nagLeague = new Leaderboard('matchLeaderboard' + matchId + "_" + league[i]._id, {pageSize:10}, client1)
	        	nagLeague.add(userId,points,function(err){
					if(err)
						console.log(err)
					i++;
		        	if(i != n)
		        		leagueLoop(i);
		        	if(i == n)
		        		callback()
				})
	        }
	        leagueLoop(i)
	      }else{
	      	callback()
	      }
	    }
  	})
}
function sendLeaderboardNotification(matchId){
	getMatchTeamNames(matchId,function(matchName){
		db.LeaguesInfo.find({matchId:matchId,leagueName:{$ne:{$regex:"piblicLEague"}}},{leagueName:1,users:1},function(err,leagues){
		    if(err){
		      console.log("error in getting leagues getFriendLeagueStatus " + err)
		    }else{
		      if(leagues.length){
		        var i=0,n=leagues.length;
		        function leagueLoop(i){
		    		console.log("league Name is :" + leagues[i].leagueName);
		    		var nagLeague = new Leaderboard('matchLeaderboard' + matchId + "_" + leagues[i].leagueName, {pageSize:10}, client1)
		    		var j=0,m = leagues[i].users.length;
		    		function userLoop(j){
		    			console.log("user id to find rank in league == " + leagues[i].users[j]);
		    			nagLeague.rank(leagues[i].users[j],function(err,rank){
							console.log("rank of " + leagues[i].users[j] + " is ************ " + rank)
							if(rank == 1)
								ranke = "st";
							else if(rank == 2)
								ranke = "nd";
							else if(rank == 3)
								ranke = "rd";
							else
								ranke = "th";
							rankdata = rank + ranke;
							var notificationMessage = "Congratulations! You have finished at " + rankdata + " place in your league in the " + matchName + " match.";
							sendNotification(notificationMessage,leagues[i].users[j],function(){
								j++;
				    			if(j != m)
				    				userLoop(j)
				    			if(j == m){
				    				i++;
				    				if(i != n)
				    					leagueLoop(i)
				    			}
							})
						})
		    		}
		    		userLoop(j)
		        }
		        leagueLoop(i)
		      }
		    }
		})
	})
}
function getMatchTeamNames(matchId,callback){
  db.Match_Shedule.findOne({matchId:matchId},{StartDate:1,"team1.teamName":1,"team2.teamName":1,matchId:1},function(err1,matches){
    if(err1){
      console.log("error in getting matches getMatchTeamNames" + err1)
    }else{
      if(matches){
        callback(matches.team1.teamName + " v " + matches.team2.teamName)
      }
    } 
  })
}
function checkMatchFinished(matchId,callback){
	var upcoming_matches_url = "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20cricket.scorecard.summary%20where%20match_id%3D" + matchId + "&format=json&diagnostics=true&env=store%3A%2F%2F0TxIGQMQbObzvU4Apia0V0&callback="
	request(upcoming_matches_url,function(err, resp, matchContent){
		var matches_object = JSON.parse(matchContent);
		// code to update man of the match
		var result = matches_object.query.results.Scorecard.result;
		if(result === undefined)
			callback(0)
		else{
			if(result.mom)
				callback(1)
			else
				callback(0)
		}
	})
}
exports.updateMatchFinalSquad = function (notificationMessage,matchId){
	var unPlayedPlayers = [];
	getMatchSquadPlayers(matchId,function(squadPlayers){
			console.log(squadPlayers)
		getMatchBidPlayers(matchId,function(bidPlayers){
			console.log("in bid")
			console.log(bidPlayers)
			Array.prototype.diff = function(a) {
			    return this.filter(function(i) {return a.indexOf(i) < 0;});
			};

			unPlayedPlayers = bidPlayers.diff(squadPlayers);
			if(unPlayedPlayers.length)
				sendBackCredits(notificationMessage,unPlayedPlayers,matchId)
		})
	})
	
}
function getMatchSquadPlayers(matchId,callback){
	db.MatchPlayers.findOne({matchId:matchId},function(err1,match){
	    if(err1){
	      console.log("error in getting matches getMatchTeamNames" + err1)
	    }else{
	      if(match){
	      	var squadPlayers = [];
	        var i=0,ni=match.teams.length;
	        function teamsLoop(i){
	        	var j=0,nj = match.teams[i].players.length;
	        	function playerLoop(j){
	        		squadPlayers.push(match.teams[i].players[j].playerId);
	        		j++;
	        		if(j != nj)
	        			playerLoop(j)
	        		else{
	        			i++;
	        			if(i != ni)
	        				teamsLoop(i)
	        			else
	        				callback(squadPlayers)
	        		}
	        	}playerLoop(j)
	        }teamsLoop(i)
	      }
	    } 
  	})
}
function getMatchBidPlayers(matchId,callback){
  	var bidPlayersList = [];
	db.Player_Bid_Info.find({matchId:matchId},{playerId:1,_id:0},function(err1,bidPlayers){
	    if(err1){
	      console.log("error in getting matches getMatchTeamNames" + err1)
	    }else{
	      if(bidPlayers.length){
	        var i=0,ni=bidPlayers.length;
	        function teamsLoop(i){
	        	bidPlayersList.push(bidPlayers[i].playerId);
	        	i++;
    			if(i != ni)
    				teamsLoop(i)
    			else
    				callback(bidPlayersList)
	        }teamsLoop(i)
	      }else{
	      	callback(bidPlayersList)
	      }
	    } 
  	})
}
function sendBackCredits(notificationMessage,unPlayedPlayers,matchId){
	var i=0,ni=unPlayedPlayers.length;
	if(ni){
		var notificationMessage = "";
		function playerLoop(i){
			console.log(unPlayedPlayers[i] + " playerid " + matchId)
			getPlayerName(unPlayedPlayers[i],function(playerName){
				notificationMessage.replace("playerName",playerName)
				db.Player_Bid_Info.findOne({matchId:matchId,playerId:unPlayedPlayers[i]},function(err1,bidInfoDoc){
				    if(err1){
				      console.log("error in getting matches getMatchTeamNames" + err1)
				    }else{
						if(bidInfoDoc){
							var j=0,nj = bidInfoDoc.bidInfo.length;
							function bidUserLoop(j){
								console.log(bidInfoDoc.bidInfo[j].FBID + " ==== " + bidInfoDoc.bidInfo[j].bidAmount);
								db.userSchema.update({_id:bidInfoDoc.bidInfo[j].FBID},{$inc:{Credits:bidInfoDoc.bidInfo[j].bidAmount}},function(err,updated){
									if(err)
										console.log("error in updating user credits " + err)
									else{
										console.log(updated)
										sendNotification(notificationMessage,bidInfoDoc.bidInfo[j].FBID,function(){
											j++;
											if(j != nj)
												bidUserLoop(j);
											else{
												bidInfoDoc.remove()
												i++;
												if(i != ni)
													playerLoop(i)
											}
										})
									}
								})
							}bidUserLoop(j)
						}else{
							i++;
							if(i != ni)
								playerLoop(i)
						}
			      	}
		      	})
			})
			
			
		}playerLoop(i)
	}
	
}
function getPlayerName(playerId,callback){
  db.Player_Profile.findOne({playerId:playerId},{fullname:1,_id:0},function(err,playerName){
    if(err){
      console.log("error in getting player profile in getPlayerName function" + err)
    }else{
      if(playerName){
        callback(playerName.fullname)
      }else{
      	callback()
      }
    }
  })
}