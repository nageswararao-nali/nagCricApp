var async = require('async');
var request = require('request');
var cheer = require('cheerio');
var db = require('./db');
var help_script = require('./helper_script');
var redis = require('redis');
var client1 = redis.createClient();

var all_matches = help_script.scoreboard1.all_matches;
var bowling_stat = help_script.scoreboard1.bowling_stat;
var batting_score = help_script.scoreboard1.batting_score;
var match_full_info = help_script.scoreboard1.match_full_info;

exports.getMatches = function(maincallback){
	var upcoming_matches_url = "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20cricket.upcoming_matches&format=json&diagnostics=true&env=store%3A%2F%2F0TxIGQMQbObzvU4Apia0V0&callback="
	request(upcoming_matches_url,function(err, resp, matchContent){
		var matches_object = JSON.parse(matchContent);
		var matches = matches_object.query.results.Match;
		var teams = [];
		async.eachSeries(matches,function(match,callback){
			teams.push(match.Team[0].teamid)
			teams.push(match.Team[1].teamid)
			db.Match_Shedule.findOne({matchId : match.matchid},function(err,docs){
		    	if(docs){
		    		var match_start_date = new Date(match.StartDate)
					var match_end_date = new Date(match.EndDate)
		    		docs.StartDate = match_start_date.toISOString();
					docs.EndDate = match_end_date.toISOString();
		    		docs.save();
		    		console.log("match updated");
		    		callback();
		    	}else{
		    		upcomming_match_object = {};team_object = {};
					upcomming_match_object.matchId = match.matchid;
					upcomming_match_object.mtype = match.mtype;
					upcomming_match_object.series_id = match.series_id;
					upcomming_match_object.series_name = match.series_name;
					upcomming_match_object.MatchNo = match.MatchNo;
					var match_start_date = new Date(match.StartDate)
					var match_end_date = new Date(match.EndDate)
					upcomming_match_object.StartDate = match_start_date.toISOString();
					upcomming_match_object.EndDate = match_end_date.toISOString();
					upcomming_match_object.team1 = {}
					upcomming_match_object.team2 = {}
					upcomming_match_object.team1.teamName = match.Team[0].Team;
					upcomming_match_object.team1.teamId = match.Team[0].teamid;
					upcomming_match_object.team2.teamName = match.Team[1].Team;
					upcomming_match_object.team2.teamId = match.Team[1].teamid;
					var match_shedule_info = new db.Match_Shedule(upcomming_match_object);
				    match_shedule_info.save(function(err, recs){
				    	if(err)
				    		console.log("error in saving match")
				    	else{
				    		console.log("match saved sussfully")
				    		callback();
				    	}
				    });
		    	}
			})
			
		},function(err){
			console.log(teams.length + " ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++")
			getTeamInfo(teams,function(){
				console.log(" in 111111111111111111111111111111111111111111")
				maincallback(null,"one");
			})
		})
	})
}
exports.getUpcomingSeriesMatches = function(maincallback){
	var upcoming_matches_url = "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20cricket.series.upcoming&format=json&diagnostics=true&env=store%3A%2F%2F0TxIGQMQbObzvU4Apia0V0&callback="
	request(upcoming_matches_url,function(err, resp, matchContent){
		var matches_object = JSON.parse(matchContent);
		var series_array = matches_object.query.results.Series;
		var teams = [];
		async.eachSeries(series_array,function(series,callback){
			var matches = series.Schedule.Match;
			async.eachSeries(matches,function(match,callback1){
				if(teams.indexOf(match.Team[0].teamid) == -1)
					teams.push(match.Team[0].teamid)
				if(teams.indexOf(match.Team[1].teamid) == -1)
					teams.push(match.Team[1].teamid)
				db.Match_Shedule.findOne({matchId : match.matchid},function(err,docs){
			    	if(docs){
			    		var match_start_date = new Date(match.StartDate)
						var match_end_date = new Date(match.EndDate)
			    		docs.StartDate = match_start_date.toISOString();
						docs.EndDate = match_end_date.toISOString();
			    		docs.save();
			    		console.log("match updated");
			    		callback1();
			    	}else{
			    		upcomming_match_object = {};team_object = {};
						upcomming_match_object.matchId = match.matchid;
						upcomming_match_object.mtype = match.mtype;
						upcomming_match_object.series_id = series.SeriesId;
						upcomming_match_object.series_name = series.SeriesName;
						upcomming_match_object.MatchNo = match.MatchNo;
						var match_start_date = new Date(match.StartDate)
						var match_end_date = new Date(match.EndDate)
						upcomming_match_object.StartDate = match_start_date.toISOString();
						upcomming_match_object.EndDate = match_end_date.toISOString();
						upcomming_match_object.team1 = {}
						upcomming_match_object.team2 = {}
						upcomming_match_object.team1.teamName = match.Team[0].Team;
						upcomming_match_object.team1.teamId = match.Team[0].teamid;
						upcomming_match_object.team2.teamName = match.Team[1].Team;
						upcomming_match_object.team2.teamId = match.Team[1].teamid;
						var match_shedule_info = new db.Match_Shedule(upcomming_match_object);
					    match_shedule_info.save(function(err, recs){
					    	if(err)
					    		console.log("error in saving match")
					    	else{
					    		console.log("match saved sussfully")
					    		callback1();
					    	}
					    });
			    	}
				})
				
			},function(err){
				// console.log(teams.length)
				// getTeamInfo(teams)
				callback();
			})
			
		},function(err){
			// console.log(teams)
			getTeamInfo(teams,function(){
				console.log("in 2222222222222222222222222222222222222222222222222")
				maincallback(null,"Two")
			})
			// teams.distinct();
			// console.log(teams.length)
		})
	})	
}
var getTeamInfo = function(teamArray,cback){
	async.eachSeries(teamArray,function(teamId,callback){
		if(teamId){
			db.Team_Info.findOne({teamId : teamId},function(err,teamdocs){
				if(teamdocs){
					console.log(teamdocs.teamId)
					callback();
				}else{
					console.log(teamId + " =======================")
					var teamInfoUrl = "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20cricket.team.profile%20where%20team_id%3D" + teamId + "&format=json&diagnostics=true&env=store%3A%2F%2F0TxIGQMQbObzvU4Apia0V0&callback="
					request(teamInfoUrl,function(err, resp, teamProfile){
						var teamProfile = JSON.parse(teamProfile);
						var teamInfoObj = teamProfile.query.results.TeamProfile;
						var teamInfo = {}, players = [];
						teamInfo.teamId = teamId;
						teamInfo.teamName = teamInfoObj.TeamName;
						teamInfo.teamShortName = teamInfoObj.ShortName;
						teamInfo.teamLogoPath = teamInfoObj.TeamLogoPath;
						teamInfo.teamLogoSmallPath = teamInfoObj.TeamLogoSmallPath;
						teamInfo.teamFlagPath = teamInfoObj.TeamFlagPath;
						teamInfo.teamSmallFlagPath = teamInfoObj.TeamSmallFlagPath;
						teamInfo.teamRoundFlagPath = teamInfoObj.TeamRoundFlagPath;
						teamInfo.teamSmallRoundFlagPath = teamInfoObj.TeamSmallRoundFlagPath;
						teamInfo.teamLargeRoundFlagPath = teamInfoObj.TeamLargeRoundFlagPath;
						function savePlayers (playerInfo,teamId,callback2){
							player = {};
							var personId = player.playerId = playerInfo.personid;
							db.Player_Profile.findOne({playerId : personId},function(err2,docs){
								if(err2){
									console.log(err2)
								}else{
									if(docs){
							    		console.log(docs)
							    		callback2();
							    	}else{
										player.playerId = playerInfo.personid
										player.teamId = teamId;
										player.firstName = playerInfo.FirstName
										player.lastName = playerInfo.LastName
										var Player_Profile_Info = new db.Player_Profile(player);
									    Player_Profile_Info.save(function(err, recs){
									    	if(err)
									    		console.log("error in saving player profile")
									    	else{
									    		console.log(recs);
									    		console.log("player profile saved sussfully")
									    		callback2()
									    	}
									    });
							    	}
								}
							})
						}
						console.log(teamInfoObj.Players)
						if(teamInfoObj.Players != null){
							async.eachSeries(teamInfoObj.Players.Player,function(playerInformation,callback1){
								var personId = playerInformation.personid
								players.push(personId)
								savePlayers(playerInformation,teamId,function(){
									callback1();
								})
							},function(err1){
								if(err1)
									console.log(err1)
								else{
									teamInfo.players = players;
									var Team_Profile_Info = new db.Team_Info(teamInfo);
								    Team_Profile_Info.save(function(err, recs){
								    	if(err)
								    		console.log("error in saving team info")
								    	else
								    		console.log("Team saved sussfully")
								    });
								}
								callback()
							})
						}else{
							console.log("Team info with " + teamId + "not available")
							callback()
						}
					})
				}
			})
		}else{
			cback()
		}
		
	},function(err){
		console.log("All teams are Saved ")
		cback();
	})
}

exports.getTeamInfo = getTeamInfo;
exports.getSquadInfo = function(maincallback){
	var newDate = new Date();
	console.log(newDate)
	// newDate = newDate.toISOString()
	// db.Match_Shedule.find({StartDate:{$gte : newDate}},{matchId:1,"team1.teamId":1,"team1.teamName":1,"team2.teamId":1,"team2.teamName":1},function(err,docs){
	db.Match_Shedule.find({matchId:190543},{matchId:1,"team1.teamId":1,"team1.teamName":1,"team2.teamId":1,"team2.teamName":1},function(err,docs){
		console.log(docs.length + " matches length..............")
		console.log(docs)
		var i=1;
		async.eachSeries(docs,function(match,callback){
			var squad_url = "https://cricket.yahoo.com/prematch-" + match.team1.teamName.replace(/ /gi,"-") + "-vs-" + match.team2.teamName.replace(/ /gi,"-") + "_" + match.matchId;
			console.log(squad_url)
			request(squad_url,function(err, resp, matchSquad){
				if(err){
					console.log(err)
					callback();
				}
				else{
					var matchId = match.matchId;
					var matchPlayer = {};
					matchPlayer.matchId = matchId;
					matchPlayer.teams = [];
					var $ = cheer.load(matchSquad);
					function getMatchPlayer(squad_content,callback1){
						var j = 0,x=squad_content.length;
						squad_content.each(function(){
							var teamShortName = $(this).find("p").text().substring(0,3).trim();
							var ulList = $(this);
							db.Team_Info.findOne({teamShortName : teamShortName},{teamId:1},function(err1,teamdocs){
								if(err1)
									console.log("error in finding team")
								else{
									if(teamdocs && ulList.find("li").length){
										teamInfoContent = {};
										var teamDocId = teamdocs.teamId; 
										teamInfoContent.teamId = teamDocId;
										client1.sadd("squad_" + matchId + "_teams",teamDocId)
										teamInfoContent.players = [];
										var n = ulList.find("li").length; ii=0;
										ulList.find("li").each(function(){
											var plyrInfo = {}
											var plyr = $(this).find("a").attr("href").split("_")[1]
											var plyr_name = $(this).find("a").text().trim();
											console.log(j + " ---------------------- " + plyr)
											plyrInfo.playerId = plyr;
											plyrInfo.playerName = plyr_name;
											plyrInfo.averageBid = 10;
											plyrInfo.highestBid = 10;
											plyrInfo.matchFantasyPoints = 10;
											client1.sadd("squad_" + matchId + "_team" + teamDocId,plyr)
											console.log("squad." + matchId + "." + teamDocId + "." + plyr)
											client1.hmset("squad." + matchId + "." + teamDocId + "." + plyr,plyrInfo,function(err,arg){
												console.log(arg)
											})
											teamInfoContent.players.push(plyrInfo)
											ii++;
											if(ii == n){
												j++;
												console.log(teamInfoContent.players.length)
												matchPlayer.teams.push(teamInfoContent)
												console.log(j + "=========================================+++++" + x)
												if(j == x)
												{
													console.log("================================================")
													/*client1.hmset("squad_" + matchId,"",matchPlayer,function(err,obj){
														console.log(err)
														console.log(obj)
													})*/
													callback1();
												}
											}
										})
									}else{
										console.log(teamShortName + " not found=========================")
										callback1()
									}
								}
							})
							console.log(teamShortName)
						})
					}
					function getMatchPlayerStarted(squad_content,callback1){
						var j = 0,x=squad_content.length;
						console.log(x)
						squad_content.each(function(){
							var teamShortName = $(this).find(".ycric-playingeleven-flagholder").find(".ycric-playingeleven-teamsname").html().trim().substring(0,3).trim();
							var ulList = $(this);
							db.Team_Info.findOne({teamShortName : teamShortName},{teamId:1},function(err1,teamdocs){
								if(err1)
									console.log("error in finding team")
								else{
									if(teamdocs){
										teamInfoContent = {};
										var teamDocId = teamdocs.teamId; 
										teamInfoContent.teamId = teamDocId;
										client1.sadd("squad_" + matchId + "_teams",teamDocId)
										teamInfoContent.players = [];
										var n = ulList.find(".ycric-playingeleven-playernames a").length;i=1;
										ulList.find(".ycric-playingeleven-playernames a").each(function(){
											var plyrInfo = {}
											var plyr = $(this).attr("href").split("_")[1]
											var plyr_name = $(this).text().trim()
											console.log(plyr)
											plyrInfo.playerId = plyr;
											plyrInfo.playerName = plyr_name;
											plyrInfo.averageBid = 10;
											plyrInfo.highestBid = 10;
											plyrInfo.matchFantasyPoints = 10;
											client1.sadd("squad_" + matchId + "_team" + teamDocId,plyr)
											console.log("squad." + matchId + "." + teamDocId + "." + plyr)
											client1.hmset("squad." + matchId + "." + teamDocId + "." + plyr,plyrInfo,function(err,arg){
												console.log(arg)
											})
											teamInfoContent.players.push(plyrInfo)
											i++;
											if(i == n){
												j++;
												console.log(teamInfoContent)
												matchPlayer.teams.push(teamInfoContent)
												console.log("=========================================" + j)
												if(j == x){
													console.log("================================================")
													callback1();
												}
											}
										})
									}else{
										console.log(teamShortName + "not foound================================")
										callback1()
									}
								}
							})
							console.log(teamShortName)
						})
					}
					var team1Name = match.team1.teamName;
					var team2Name = match.team2.teamName;
					if($(".ycric-prem-squaddet").length == 0){
						getMatchPlayerStarted($(".ycric-playingeleven-entry"),function(){
							var rcon = matchPlayer;
							client1.hmset("squad." + matchId,rcon,function(err,arg){
								if(err)
									console.log(err)
								else
									console.log(arg)
							})
							db.MatchPlayers.findOne({matchId : matchId},function(err2,matchPlayerdocs){
								if(err2)
									console.log("error in matchplayer")
								else{
									if(matchPlayerdocs){
										matchPlayerdocs.teams = matchPlayer.teams;
										console.log("match players updated")
										matchPlayerdocs.save();
										callback()
									}else{
										var matchPlayerInfo = new db.MatchPlayers(matchPlayer)
										matchPlayerInfo.save(function(err,recs){
											if(err)
												console.log("error in inserting match players")
											else{
												console.log(recs)
												console.log("match player info saved")
												var notificationMessage = team1Name + " Vs " + team2Name + " match strartd. Start bidding";
												// sendSquadAnouncecNotification(notificationMessage,function(){
													callback()
												// })
											}
										})
									}
								}
							})
							
						})
					}else{
						getMatchPlayer($(".ycric-prem-squaddet"),function(){
							/*for(var i=0;i<matchPlayer.teams.length;i++){
								var t = matchPlayer.teams[i].teamId
								client1.sadd("squad_" + matchId + "_teams",t)
								client1.hmset("squad." + matchId + ".team" + i,matchPlayer.teams[i].players)
							}*/
							/*var rcon = matchPlayer;
							console.log(matchPlayer.teams)
							client1.hmset("squad." + matchId,rcon,function(err,arg){
								if(err)
									console.log(err)
								else
									console.log(arg)
							})*/
							var rcon = matchPlayer;
							client1.hmset("squad." + matchId,rcon,function(err,arg){
								if(err)
									console.log(err)
								else
									console.log(arg)
							})
							db.MatchPlayers.findOne({matchId : matchId},function(err2,matchPlayerdocs){
								if(err2)
									console.log("error in matchplayer")
								else{
									if(matchPlayerdocs){
										matchPlayerdocs.teams = matchPlayer.teams;
										matchPlayerdocs.save();
										console.log("match players updated")
										callback()
									}else{
										var matchPlayerInfo = new db.MatchPlayers(matchPlayer)
										matchPlayerInfo.save(function(err,recs){
											if(err)
												console.log("error in inserting match players")
											else{
												console.log(recs)
												console.log("match player info saved")
												var notificationMessage = team1Name + " Vs " + team2Name + " match strartd. Start bidding";
												sendSquadAnouncecNotification(notificationMessage,function(){
													callback()
												})
											}
										})
									}
								}
							})
						})
					}
				}
			})
		},function(err){
			console.log(" all matches completed  **************************************************")
			getMatchUrl(function(){
				console.log("full match details updated")
				maincallback(null,"Three")
			})
		})
	})
}
function sendSquadAnouncecNotification(notificationMessage,callback){
	var pDate = new Date();
	var uDate = pDate.setDate(pDate.getDate() - 3) // 3 days before date
	db.userSchema.find({loginDate:{$lte:uDate}},{_id:1},function(err,users){
		if(err){
			console.log("error in getting users " + err)
		}else{
			if(users){
				console.log(users.length)
				var j=0,nj=users.length;
				for(var i=0;i<users.length;i++){
					console.log(users[i]._id)
					var notification = {};
					notification.user = users[i]._id;
					notification.message = notificationMessage;
					notification.createDate = new Date();
					console.log(notification)
					var notifications = new db.Notifications(notification);
					notifications.save(function(err,recs){
						if(err){
							console.log("error in saving notification " + err)
						}else{
							console.log("save notification ")
							j++;
							if(j == nj){
								/*sendSquadAnouncecNotificationToFollowedUsers(notificationMessage,function(){
									callback()
								})*/
								callback()
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
function sendSquadAnouncecNotificationToFollowedUsers(notificationMessage,callback){
	db.matchFollowers.find({loginDate:{$lte:uDate}},{_id:1},function(err,users){
		if(err){
			console.log("error in getting users " + err)
		}else{
			if(users){
				console.log(users.length)
				var j=0,nj=users.length;
				for(var i=0;i<users.length;i++){
					console.log(users[i]._id)
					var notification = {};
					notification.user = users[i]._id;
					notification.message = notificationMessage;
					notification.createDate = new Date();
					console.log(notification)
					var notifications = new db.Notifications(notification);
					notifications.save(function(err,recs){
						if(err){
							console.log("error in saving notification " + err)
						}else{
							console.log("save notification ")
							j++;
							if(j == nj){
								callback()
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
exports.getPlayerOtherInfo = function(queryCriteria){
	db.Player_Profile.find(queryCriteria,{playerId:1,firstName:1,lastName:1,teamId:1},function(err, docs){
		if(err)
			console.log("error in getting player profile info")
		else{
			async.eachSeries(docs,function(player,callback){
				var fname = player.firstName,lname = player.lastName;
				if(fname === null)
					fname = "";
				if(lname === null)
					lname = "";
				var player_name = fname + " " + lname;
				var search_url = "http://search.espncricinfo.com/ci/content/site/search.html?search=" + player_name;
				var playerOtherInfo = {};
				request(search_url,function(err2, resp, searchResultPage){
					if (err2) {
						console.error('request failed', err2);
					}else{
						console.log(player_name)
						$ = cheer.load(searchResultPage);
						if($("#plysRslt").find("ul li").length>1){
							db.team_info.findOne({teamId:player.teamId},{teamName:1,_id:0},function(err, docss){
								if(docss){
									$("#plysRslt").find("ul li").each(function(){
										if($(this).find("span").text().trim() == docss.teamName){
											var pl_url = $(this).find("a").attr("href");
											var player_url = "";
											if(pl_url === "undefined")
												player_url = "";
											else
												player_url = "http://www.espncricinfo.com" + pl_url;
											console.log(player_url + "-------------------")
											cricPlayerId = player_url.split("/").pop().substring(0,player_url.split("/").pop().indexOf("."))
											if(cricPlayerId == "www"){
												callback()
											}else{
												playerOtherInfo.cricPlayerId = cricPlayerId;
												playerOtherInfo.cricPlayerUrl = player_url;
												playerOtherInfo.cricAPlayerUrl = "";
												console.log(cricPlayerId)
												db.Player_Profile.update({playerId:player.playerId},{$set : {otherInfo : playerOtherInfo}},function(err3,result){
													if(err3){
														console.log("error in updation")
														callback()
													}
													else{
														console.log(result)
														callback()
													}
												})
											}
										}
									})
								}
							})

						}else{
							var pl_url = $("#plysRslt").find("ul li a").attr("href");
							var player_url = "";
							if(pl_url === "undefined")
								player_url = "";
							else
								player_url = "http://www.espncricinfo.com" + pl_url;
							console.log(player_url + "-------------------")
							cricPlayerId = player_url.split("/").pop().substring(0,player_url.split("/").pop().indexOf("."))
							if(cricPlayerId == "www"){
								callback()
							}else{
								playerOtherInfo.cricPlayerId = cricPlayerId;
								playerOtherInfo.cricPlayerUrl = player_url;
								playerOtherInfo.cricAPlayerUrl = "";
								console.log(cricPlayerId)
								db.Player_Profile.update({playerId:player.playerId},{$set : {otherInfo : playerOtherInfo}},function(err3,result){
									if(err3){
										console.log("error in updation")
										callback()
									}
									else{
										console.log(result)
										callback()
									}
								})
							}
						}
						
						
						// return html
						//callback()

					}
				})

			},function(err1){
				console.log("other info updated successfully")
			})
			
		}
	})
}
exports.getPlayerStatInfo = function(queryCriteria){
	db.Player_Profile.find(queryCriteria,{playerId:1,"otherInfo.cricPlayerId":1,"otherInfo.cricPlayerUrl":1},{limit:50},function(playerGetErr, playerDocs){
		if(playerGetErr){
			console.log("error in getting player info from player profile");
		}
		else{
			if(playerDocs){
				var playerIds = [];
				async.eachSeries(playerDocs,function(playerDoc,callback){
					playerIds.push(playerDoc.playerId)
					var url = playerDoc.otherInfo.cricPlayerUrl;
					if(url.indexOf("undefined") >= 0 || url == ""){
						callback();
					}
					else{
						console.log(url)
						console.log(url.indexOf("undefined"))
						var batting_statistic_fields = help_script.player.statistic_fields;
						var bowling_statistic_fields = help_script.player.bowling_statistic_fields;
						var required_match_type = ["Tests","ODIs","Twenty20"];
						request(url,function(error, response, html){
							$ = cheer.load(html);
							var content = $(".pnl490M");
							var player_name_content = content.find(".ciPlayernametxt").find("h1").html();
							var player_name = player_name_content.substring(0,player_name_content.indexOf("<a"));
							var player_country = content.find(".ciPlayernametxt").find("h3").text();
							var player_fullname = content.find(".ciPlayerinformationtxt").eq(0).find("span").text();
							var batting_match_type_obj = {
								"Tests" :  null,
				  				"ODIs": null,
				  				"Twenty20": null
							},bowling_match_type_obj = {
								"Tests" :  null,
				  				"ODIs": null,
				  				"Twenty20": null
							};
							function getStatistics(tr_content,callback1){
								match_type = tr_content.find('td:nth-child(1) b').text();
								bat_loop_count=2; var fields = {};
								for(var statistic_fields_prop in batting_statistic_fields){
									fields[statistic_fields_prop] = tr_content.find('td:nth-child('+ bat_loop_count +')').text();
									bat_loop_count++;
								}
								callback1(fields);
							}
							function getBowlingStatistics(tr_content,callback1){
								match_type = tr_content.find('td:nth-child(1) b').text();
								bow_loop_count=2;var fields = {};
								for(var bowling_statistic_fields_prop in bowling_statistic_fields){
									fields[bowling_statistic_fields_prop] = tr_content.find('td:nth-child('+ bow_loop_count +')').text();
									bow_loop_count++;
								}	
								callback1(fields);
							}
							$(".pnl490M table").eq(0).find('tbody tr').each(function(){
								if(required_match_type.indexOf($(this).find('td:nth-child(1) b').text()) != -1){
									getStatistics($(this),function(fields){
										batting_match_type_obj[match_type] = fields;
									})
										
								}
							});
							$(".pnl490M table").eq(1).find('tbody tr').each(function(){
								if(required_match_type.indexOf($(this).find('td:nth-child(1) b').text()) != -1){
									getBowlingStatistics($(this),function(fields){
										bowling_match_type_obj[match_type] = fields;	
									})
								}
							});
						    db.Player_Profile.findOne({playerId : playerDoc.playerId},function(err,docs){
						    	if(docs){
						    		docs.batting_info = batting_match_type_obj;
						    		docs.bowling_info = bowling_match_type_obj;
						    		docs.fullname = player_fullname;
						    		docs.country = player_country;
						    		docs.save();
						    		console.log(playerDoc.playerId);
						    		console.log("player stats updated");
									callback();
						    	}else{
						    		console.log("player id not there")
						    		callback()
						    	}
						    })
						});
					}
				},function(asyncerr){
					if(asyncerr)
						console.log("error in some where else in series")
					else{
						console.log("player stats updated successfully")
						getMaidens(playerIds,function(){
							console.log("maidens updated")
						})
					}
				})
			} else{
				console.log("no docs find")
			}
		}
	})
}
var getMaidens = function (playerIds,maincallback){
	db.Player_Profile.find({bowling_info:{$exists:true},"bowling_info.Twenty20":{$ne:null},playerId:{$in:playerIds}},function(err,docs){
		async.eachSeries(docs,function(doc,callback){
			if(doc.fullname){
				getMaidensInfo(doc.fullname,function(maidens){
					console.log(maidens)
					console.log(doc.playerId)
					db.Player_Profile.update({playerId : doc.playerId},{$set : {"bowling_info.Twenty20.Maidens" : maidens}},function(err1,result){
						if(err1){
							console.log(err1)
						}
						else{
							console.log(result);
							console.log(doc.fullname + "===" + maidens);
							callback();
						}
					});
				})
			}else{
				callback()
			}
		},function(err2){
			if(err2)
				console.log("error")
			else
				console.log("completed ")
			maincallback()
		})
	})
}
function getMaidensInfo(player_name,callback){
	var player_name = player_name;
	player_name.trim();
	var formData = {
	  searchkeyword: player_name,
	};
	request.post({url:'http://cricketarchive.com/cgi-bin/search2.cgi', formData: formData,followAllRedirects: true}, function(err, httpResponse, html) {
	  if (err) {
	    console.error('upload failed:', err);
	    callback(0);
	  }else{
	  	$ = cheer.load(html);
	  	var n=$("#columnLeft table").length;var i=0;
	  	$("#columnLeft table").each(function(){
	  		var match_type_content = $(this).find("tr").eq(0).find("td b").text();
			if((match_type_content.indexOf("Twenty20") != -1) && (match_type_content.indexOf("Bowling") != -1) && (match_type_content.indexOf("International") == -1)){
				var madins = $(this).find("tr").eq(2).find("td").eq(2).text();
				callback(madins);
			}else{
				i++;
				if(i == n)
					callback(0);
			}
	  	})
	  }
	  // res.write("body starts here -------------");
	  
	});
}
exports.getMaidens = getMaidens;
function getMatchUrl(matchcallback){
	var newDate = new Date();
	var weakDayArray = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
	var month = ["Jan","Feb","Mar","Apr","May","June","July","Aug","Sept","Oct","Nov","Dec"];
	console.log(weakDayArray[newDate.getDay()] + " " + month[newDate.getMonth()] + " " + newDate.getDate())
	// newDate = newDate.toISOString();
	var search_url = "http://www.espncricinfo.com/ci/content/match/fixtures/index.html";
	var playerOtherInfo = {};
	request(search_url,function(err2, resp, searchResultPage){
		$ = cheer.load(searchResultPage);

		db.Match_Shedule.find({matchId:190543},function(err,docs){
			if(err){
				console.log("error with "+ err)
			}else{
				if(docs){
					async.eachSeries(docs,function(doc,callback){
						var sDate = new Date(doc.StartDate)
						// console.log(doc)
						var checkDate = weakDayArray[sDate.getDay()] + " " + month[sDate.getMonth()] + " " + sDate.getDate(); 
						// console.log(weakDayArray[sDate.getDay()] + " " + month[sDate.getMonth()] + " " + sDate.getDate())
						// console.log($("#fixTable tr").length)
						var j=0,x=$("#fixTable tr").length;
						var otherInfo = {};
						$("#fixTable tr").each(function(){
							if($(this).attr("id") !== undefined){
								var id = $(this).attr("id");
								id++;
								console.log($(this).find("p").text().trim() + " == " + checkDate)
								if($(this).find("p").text().trim() == checkDate){
									console.log("matched == " + checkDate)
									if($(this).nextUntil("#" + id).length){
										// j++;
										var i=0,n=$(this).nextUntil("#" + id).length;
										$(this).nextUntil("#" + id).each(function(){
											// console.log($(this).find("td").eq(1).find("b").text().trim())
											var match_name = $(this).find("td").eq(1).find("b").text().trim();
											console.log(match_name)
											if(match_name.indexOf(doc.team1.teamName) != -1 && match_name.indexOf(doc.team1.teamName) != -1){
												if($(this).find("td").eq(1).find("a").attr("href") !== undefined){
													var cric_match_id = $(this).find("td").eq(1).find("a").attr("href").split("/").pop().split(".")[0]
													console.log(cric_match_id)
													otherInfo.cricmatchUrl = "http://www.espncricinfo.com" + $(this).find("td").eq(1).find("a").attr("href");
													otherInfo.cricmatchId = cric_match_id;
													db.Match_Shedule.update({matchId:doc.matchId},{$set:{otherInfo:otherInfo}},function(err2,result){
														if(err2)
															console.log("error in updating")
														else{
															console.log(result)
															console.log(doc.matchId + " updateddddddddddddddddddddddddddddddddddddd")

															callback();
														}
													})
												}
												i++;
												if(i==n){
													j++;
													if(j == x)
														callback()
												}

											}else{
												i++;
												if(i==n){
													j++;
													if(j == x)
														callback()
												}
											}
										})
									}else{
										j++;
										if(j == x)
											callback()			
									}
								}else {
									j++;
									// console.log(j + " ======== " + x)
									if(j == x)
										callback()
									console.log("not matched")
								}
							}else{
								j++;
								// console.log(j + " ======== " + x)
								if(j == x)
									callback()
							}
							// else console.log("++++" + $(this).attr("id") + "------")
						})
						// callback()
					},function(err1){
						if(err1)
							console.log("error in some function (in match url function)")
						matchcallback()
						console.log("completed")
					})
					
				}else{
					console.log("no matches found")				
				}
			}
		})
	})
	
}

exports.getLiveScorecard = function(maincallback){
	// getScorecard();
	var newDate = new Date();
	// newDate = newDate.toISOString()
	console.log(newDate)
	db.Match_Shedule.find({StartDate:{$lte:newDate},EndDate:{$gte:newDate},"otherInfo":{$exists:true}},{matchId:1,"otherInfo.cricmatchUrl":1,team1:1,team2:1,StartDate:1,EndDate:1},function(err,docs){
		if(docs){
			console.log(docs)

			/*match_ids_array = [];
			for(var i=0;i<docs.length;i++)
				match_ids_array.push(docs[i].matchId);
			console.log(match_ids_array)
			*/
			var score_board_array = []
			async.eachSeries(docs,function(match,callback){
				// console.log(match)
				// console.log(match.matchId)
				client1.sadd("live_mathces",match.matchId);
				// console.log(match.otherInfo.cricmatchUrl)
				// var match_url = "http://www.espncricinfo.com/pakistan-v-new-zealand-2014/engine/match/742619.html";
				var match_url = match.otherInfo.cricmatchUrl;
				// callback()
				getMatchScoreUrls(match_url,function(match_name,team_url_array){
					full_score_url = team_url_array['full_score'];
						getFullScoreBoard(match.matchId,match_name,full_score_url,function(match_full_info){
						// client1.publish(channel_name,JSON.stringify(match_full_info));
						console.log(match_full_info)
						for(var prop in match_full_info){
							console.log(match_full_info[prop])
						}
						console.log("bating info ------------------------------")
						for(var prop in match_full_info.batting_info.batsman_info){
							console.log(match_full_info.batting_info.batsman_info[prop])
						}
						console.log("bowling info ------------------------------")
						for(var prop in match_full_info.bowling_info.bowler_info){
							console.log(match_full_info.bowling_info.bowler_info[prop])
						}
						console.log("test flow")
						score_board_array.push(match_full_info);
						// maincallback(match_full_info)
						callback();
					});
				})
				// var match_url = match.otherInfo.cricmatchUrl;
				// console.log(docs)
			},function(err){
				console.log("getting live score completed")
				maincallback(score_board_array)
			})
			// var cricmatchUrl = docs

		}
	})

	
	
}
function getYahooScorecard(scorecard,callback){
	match_full_info.matchId = scorecard.mid;
	match_full_info.match_name = scorecard.mn;
	match_full_info.match_type = "";
	match_full_info.extras = {};
	match_full_info.total = {};
	match_full_info.batting_info = {};
	match_full_info.bowling_info = {}
	match_full_info.extras.comment = "";
	match_full_info.extras.Runs = "";
	match_full_info.total.comment = "( " + scorecard.past_ings.s.a.w + " w, " + scorecard.past_ings.s.a.o + " Overs )";
	match_full_info.total.Runs = scorecard.past_ings.s.a.r;
	match_full_info.total.RunRate = scorecard.past_ings.s.a.cr;
	match_full_info.batting_info.teamId = scorecard.past_ings.s.a.i;
	batsman_player_info = [];
	// getYahooBattingInfo()
	async.eachSeries(scorecard.past_ings.d.a.t,function(batsman,callback1){
		console.log(batsman)
		getYahooBatting(batsman,function(batsman_info){
			batsman_player_info.push(batsman_info);
			console.log(batsman_info)
			callback1()
				
		})
	},function(err){
		match_full_info.batting_info.batsman_info = batsman_player_info;
		if(scorecard.past_ings.s.a.i == scorecard.teams[0].i)
			match_full_info.bowling_info.teamId = scorecard.teams[1].i;
		else
			match_full_info.bowling_info.teamId = scorecard.teams[0].i;

		var bowling_player_info = [];
		n = scorecard.past_ings.d.o.t.length-1
		async.eachSeries(scorecard.past_ings.d.o.t,function(bowler,callback2){
			getYahooBowling(bowler,function(bowler_info){
				// console.log(bowler_info)
				bowling_player_info.push(bowler_info)
				
				callback2()
					
			})
		},function(err){
			match_full_info.bowling_info.bowler_info = bowling_player_info;
			callback()
		})
	})
	
	
	

}
function getYahooBatting(bastman,callback){
	batsman_info = {},batting_temp_score= {};
		db.Player_Profile.findOne({playerId:bastman.i},{fullname:1,_id:0},function(err,playerDoc){
			if(playerDoc){
				batsman_info.playerName = playerDoc.fullname;
				batsman_info.batsman_comment = bastman.c;
				if(bastman.c == "Batting"){
					if(match_full_info.match_batting_player)
						match_full_info.match_batting_runner = bastman.i
					else
						match_full_info.match_batting_player = bastman.i
				}
				 
				batsman_info.batsman_link = "";
				batsman_info.playerId = bastman.i;

				batting_temp_score.Runs = bastman.r;
				batting_temp_score.Minutes = "";
				batting_temp_score.Balls = bastman.b;
				batting_temp_score.fours = bastman.four;
				batting_temp_score.sixes = bastman.six;
				batting_temp_score.StrikeRate = bastman.sr;
				
				batsman_info.batsman_batting_info = batting_temp_score;
				callback(batsman_info)
			}else{
				callback()
			}
		})
}
function getYahooBowling(bowlers,callback){
	bowler_info = {},bowling_temp_score= {};
		// console.log("player id ==== " + bowlers.i)
		db.Player_Profile.findOne({playerId:bowlers.i},{fullname:1,_id:0},function(err,playerDoc){
			if(playerDoc){
				bowler_info.playerName = playerDoc.fullname;
				// console.log("in loop player id ==== " + x)
				// console.log("in loop player id ==== " + bowlers.i)
				bowler_info.playerId = bowlers.i;
			 	var n = bowlers.o;
				if(n != parseInt(n)){
					match_full_info.match_bowler = bowlers.i;
				}
				bowling_temp_score.Overs = bowlers.o;
				bowling_temp_score.Maidens = bowlers.mo
				bowling_temp_score.Runs = bowlers.r;
				bowling_temp_score.Wickets = bowlers.wd;
				bowling_temp_score.EconemyRates = "";
				bowling_temp_score.DotBalls = "";
				bowling_temp_score.Fours = "";
				bowling_temp_score.sixes = "";
				
				bowler_info.bowler_bowling_info = bowling_temp_score;
				// console.log(bowler_info)
				callback(bowler_info)
				// return bowler_info
				// bowling_player_info.push(bowler_info)
				/*if(x == scorecard.past_ings.d.o.t-1){
					match_full_info.bowling_info.bowler_info = bowling_player_info;
					callback()
				}*/
			}else{
				callback()
			}
		})
}
function getYahooFullScoreBoard(matchId,callback){
	var upcoming_matches_url = "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20cricket.news%20%20where%20region%3D%22%22&format=json&diagnostics=true&env=store%3A%2F%2F0TxIGQMQbObzvU4Apia0V0&callback="
	request(upcoming_matches_url,function(err, resp, scoreContent){
		// console.log(scorecard_object.scorecard)
		// var score_object = JSON.parse(scorecard_object.scorecard);
		var scoreboard_object = {};
		var score_array = scorecard_object.scorecard.query.results.Scorecard;
		if(Array.isArray(score_array)){
			console.log("array")
			for(var i=0;i<score_array.length;i++){
				if(matchId == score_array[i].mid)
					scoreboard_object = score_array[i];
			}
			getYahooScorecard(scoreboard_object,function(){
				console.log(" getting scorecard from yahoo completes")
				callback()
			})
		}
		else{
			console.log("not array")
			console.log(score_array.mid)
			if(matchId == score_array.mid){
				scoreboard_object = score_array;
				console.log("match id match")
				getYahooScorecard(scoreboard_object,function(){
					console.log(" getting scorecard from yahoo completes")
					callback()
				})
			}
		}
		

	})
}
function getMatchScoreUrls(match_url,callback){
	var team_url_array = [];
	request(match_url,function(err, resp, matchContent){
		$ = cheer.load(matchContent);
		var summery = $(".tabs-block li").eq(0).attr("data-url");
		// console.log("summery = " + summery);
		var full_score = $(".tabs-block li").eq(1).attr("data-url");
		// console.log("full score = " + full_score)
		var team1_content = String($(".team-1-name").text());//.substring(0,$(".team-1-name").html().indexOf("<s")).trim();
		// console.log("Team 1 : " + team1_content)
		var team2_content = String($(".team-2-name").text());//.substring(0,$(".team-2-name").html().indexOf("<s")).trim();
		// console.log("Team 2 : " + team2_content)
		var match_name = team1_content + " Vs " + team2_content;
		match_name.replace(/[^a-zA-Z0-9]/g,"_");
		// console.log(match_name)
		team_url_array["summery"] = summery; 
		team_url_array["full_score"] = full_score; 
		// //team_urls[match_name] = team_url_array;
		// team_urls[match_name].full_score = full_score;
		callback(match_name,team_url_array);
		// callback(match_name,team_urls);

	})
}

function getFullScoreBoard(matchId,match,full_score_url,maincallback){
	/*match_full_info = {
		match_name : null,
		countries : {}
	}
	match_full_info.match_name = match;
	match_counrties = match.split("Vs");
	match_full_info.countries[match_counrties[0].trim()] = {};
	match_full_info.countries[match_counrties[1].trim()] = {};
	full_score_url = "http://www.espncricinfo.com/" + full_score_url;
	request(full_score_url,function(err, resp, matchContent){
		$ = cheer.load(matchContent);
    	getMatchBattingInfo($(".batting-table").last(),function(){
    		maincallback(match_full_info)
		})
	})*/
	match_full_info.matchId = matchId;
	/*match_full_info = {
		match_name : null,
		countries : {}
	}*/
	match_full_info.match_name = match;
	match_counrties = match.split("Vs");
	var team1_name = match_counrties[0].trim();
	var team2_name = match_counrties[1].trim();
	// match_full_info.countries[match_counrties[0].trim()] = {};
	// match_full_info.countries[match_counrties[1].trim()] = {};
	full_score_url = "http://www.espncricinfo.com/" + full_score_url;
	request(full_score_url,function(err, resp, matchContent){
		$ = cheer.load(matchContent);
		if($(".batting-table").last() == ""){
			console.log(" batting info empty --- " + matchId)
			getYahooFullScoreBoard(matchId,function(){
				console.log("completes from yahoo")
				maincallback(match_full_info)
			})
		}else{
			var batting_div = "";
			console.log($(".batting-table").length + " tables length ")
			// console.log($(".batting-table").last().next().next().html())
			if($(".batting-table").last().next().next().html() === null){
				console.log(" in if ")
				batting_div = $(".batting-table").eq($(".batting-table").length-2)
			}
			else{
				console.log("in else")
				batting_div = $(".batting-table").last()
			}
	    	getMatchBattingInfo(batting_div,function(){
	    		// updateBattingCurrentPlayers(function(){
	    			maincallback(match_full_info)
	    		// })
			})
		}
		
	})
}
exports.updateBattingCurrentPlayers = function(match_full_info,callback){
	var k = 0;nk = match_full_info.length;
	console.log(nk);
	function matchFullLoop(k){
		var j = 0,nj = match_full_info[k].batting_info.batsman_info.length;
		function battingLoop(j){
			if(match_full_info[k].batting_info.batsman_info[j].batsman_batting_info.Comment == "not out"){
				if(match_full_info[k].batting_info.batsman_info[j].playerName.indexOf("*") > -1){
					match_full_info[k].match_batting_player = match_full_info[k].batting_info.batsman_info[j].playerId;
					console.log(j+ " == " + nj + " in if player ID ========== " + match_full_info[k].batting_info.batsman_info[j].playerId)
				}else{
					match_full_info[k].match_batting_runner = match_full_info[k].batting_info.batsman_info[j].playerId;
					console.log(j+ " == " + nj + " in else player ID ========== " + match_full_info[k].batting_info.batsman_info[j].playerId)
				}
				j++;
				// console.log(j + " --- " + nj)
				if(j != nj)
					battingLoop(j)
				if(j == nj){
					updateBowlerCurrentPlayer(match_full_info,k,function(){
						k++;
						// console.log(k + " ***- " + nk)
						if(k != nk)
							matchFullLoop(k)
						if(k == nk)
							callback()
					})
				}
			}else{
				j++;
				// console.log(j + " ---- " + nj)
				if(j != nj)
					battingLoop(j)
				if(j == nj){
					updateBowlerCurrentPlayer(match_full_info,k,function(){
						k++;
						// console.log(k + " ***- " + nk)
						if(k != nk)
							matchFullLoop(k)
						if(k == nk)
							callback()
					})
				}
			}
		}
		battingLoop(j)
	}
	matchFullLoop(k)
	
}
function updateBowlerCurrentPlayer(match_full_info,k,callback){
	var j = 0, nj = match_full_info[k].bowling_info.bowler_info.length;
	for(var i=0;i<match_full_info[k].bowling_info.bowler_info.length;i++){
		var n = match_full_info[k].bowling_info.bowler_info[i].bowler_bowling_info.Overs;
		if(n != parseInt(n)){
			match_full_info[k].match_bowler = match_full_info[k].bowling_info.bowler_info[i].playerId;
		}
		// console.log(i + " === " + nj)
		if(i == nj-1)
			callback()
	}
}
function getMatchBattingInfo(batting_content,callback){
	/*var batting_player_info = {}
	var country = "";
	var heading = batting_content.find("tr").eq(0).find("th:nth-child(2)").text().trim();
	if(heading.indexOf(match_counrties[0].trim()) != -1){
		country = match_counrties[0].trim();
	}
	else if(heading.indexOf(match_counrties[1].trim()) != -1){
		country = match_counrties[1].trim();
	}
	match_full_info.countries[country].match = {};
	match_full_info.countries[country].match.match_type = heading;
	match_full_info.countries[country].match.extras = {};
	match_full_info.countries[country].match.total = {};
	match_full_info.countries[country].match.batting_info = {};
	batting_content.find("tr").each(function(){
		if($(this).hasClass("tr-heading")){
			return
		}else if($(this).hasClass("dismissal-detail")){
			return;
		}else if($(this).hasClass("extra-wrap")){
			match_full_info.countries[country].match.extras.comment = $(this).find('td:nth-child(3)').text();
			match_full_info.countries[country].match.extras.Runs = $(this).find('td:nth-child(4)').text();
		}else if($(this).hasClass("total-wrap")){
			match_full_info.countries[country].match.total.comment = $(this).find('td:nth-child(3)').text();
			match_full_info.countries[country].match.total.Runs = $(this).find('td:nth-child(4) b').text();
			match_full_info.countries[country].match.total.RunRate = $(this).find('td:nth-child(5)').text();
		}else{
			var batting_temp_score = {};bc = 4;
			var batsman_name = $(this).find('td:nth-child(2)').text();
			batting_player_info[batsman_name] = {};
			batting_player_info[batsman_name].batsman_comment = $(this).find('td:nth-child(3)').text();
			batting_player_info[batsman_name].batsman_link = $(this).find('td:nth-child(2) a').attr("href");
			for(var b_info in batting_score){
				batting_temp_score[b_info] = $(this).find('td:nth-child('+ bc +')').text();
				bc++;
			}
			batting_player_info[batsman_name].batsman_batting_info = batting_temp_score;
		}
	})
	match_full_info.countries[country].match.batting_info = batting_player_info;
	if(country === match_counrties[1].trim())
		country_name = match_counrties[1].trim()
	else
		country_name = match_counrties[0].trim()
	getBowlingInfo(country_name,heading,batting_content.next().next(),function(){
		callback();
	})*/
	var batting_player_info = {}
	var country = "",teamId = "",oppTeamId = "";
	var heading = batting_content.find("tr").eq(0).find("th:nth-child(2)").text().trim();
	if(heading.indexOf(match_counrties[0].trim()) != -1){
		country = match_counrties[0].trim();
	}
	else if(heading.indexOf(match_counrties[1].trim()) != -1){
		country = match_counrties[1].trim();
	}
	console.log(country + "------------------")
	db.Team_Info.findOne({teamName : country},{teamId : 1,_id:0},function(err,teamDoc){
		if(teamDoc){
			teamId = teamDoc.teamId;
			console.log(teamId + " team id is       ssssss")

			match_full_info.match_type = heading;
			match_full_info.extras = {};
			match_full_info.total = {};
			match_full_info.batting_info = {};
			match_full_info.batting_info.teamId = teamId;
			var batsman_player_info = [];
			var j=0;n=batting_content.find("tr").length;
			batting_content.find("tr").each(function(){
				if($(this).hasClass("tr-heading")){
					j++;
					return
				}else if($(this).hasClass("dismissal-detail")){
					j++;
					return;
				}else if($(this).hasClass("extra-wrap")){
					match_full_info.extras.comment = $(this).find('td:nth-child(3)').text();
					match_full_info.extras.Runs = $(this).find('td:nth-child(4)').text();
					j++;
				}else if($(this).hasClass("total-wrap")){
					match_full_info.total.comment = $(this).find('td:nth-child(3)').text();
					match_full_info.total.Runs = $(this).find('td:nth-child(4) b').text();
					match_full_info.total.RunRate = $(this).find('td:nth-child(5)').text();
					j++;
				}else{
					var tr_info = $(this);
					var cricPlayerId = $(this).find('td:nth-child(2) a').attr("href").split("/").pop().split(".")[0];
					db.Player_Profile.findOne({"otherInfo.cricPlayerId":cricPlayerId},{playerId:1,_id:0},function(err,playerDoc){
						if(playerDoc){
							var batting_temp_score = {},batsman_info = {};bc = 3;
							var batsman_name = tr_info.find('td:nth-child(2) a').text();
							batsman_info.playerName = batsman_name;
							batsman_info.batsman_comment = tr_info.find('td:nth-child(3)').text();
							batsman_info.batsman_link = tr_info.find('td:nth-child(2) a').attr("href");
							
							batsman_info.playerId = playerDoc.playerId;
							console.log(cricPlayerId + " ================= " + playerDoc.playerId)
							for(var b_info in batting_score){
								batting_temp_score[b_info] = tr_info.find('td:nth-child('+ bc +')').text().trim();
								bc++;
							}
							console.log(batting_temp_score)
							batsman_info.batsman_batting_info = batting_temp_score;
							batsman_player_info.push(batsman_info);
							j++;
							console.log(j + " ***************** " + n)
							if(j == n){
								match_full_info.batting_info.batsman_info = batsman_player_info;
								console.log(country + "===" + match_counrties[1].trim())
								if(country === match_counrties[1].trim()){
									console.log("in if condition ")
									country_name = match_counrties[0].trim()
									db.Team_Info.findOne({teamName : country_name},{teamId : 1,_id:0},function(err,teamDoc){
										if(teamDoc){
											oppTeamId = teamDoc.teamId;
											console.log(country_name)
											getBowlingInfo(oppTeamId,heading,batting_content.next().next(),function(){
												callback();
											})
										}else{
											console.log("first opp team not found *******************")
											callback()
										}
									})
								}
								else{
									country_name = match_counrties[1].trim()
									db.Team_Info.findOne({teamName : country_name},{teamId : 1,_id:0},function(err,teamDoc){
										if(teamDoc){
											oppTeamId = teamDoc.teamId;
											console.log(country_name)
											getBowlingInfo(oppTeamId,heading,batting_content.next().next(),function(){
												callback();
											})
										}else{
											console.log("opp team not found *******************")
											callback()
										}
									})
								}
							}
						}else{
							j++;
							console.log(" in else " + j + " ***************** " + n)
							if(j == n){
								match_full_info.batting_info.batsman_info = batsman_player_info;
								console.log(country + "===" + match_counrties[1].trim())
								if(country === match_counrties[1].trim()){
									console.log("in if condition ")
									country_name = match_counrties[0].trim()
									db.Team_Info.findOne({teamName : country_name},{teamId : 1,_id:0},function(err,teamDoc){
										if(teamDoc){
											oppTeamId = teamDoc.teamId;
											console.log(country_name)
											getBowlingInfo(oppTeamId,heading,batting_content.next().next(),function(){
												callback();
											})
										}else{
											console.log("first opp team not found *******************")
											callback()
										}
									})
								}
								else{
									country_name = match_counrties[1].trim()
									db.Team_Info.findOne({teamName : country_name},{teamId : 1,_id:0},function(err,teamDoc){
										if(teamDoc){
											oppTeamId = teamDoc.teamId;
											console.log(country_name)
											getBowlingInfo(oppTeamId,heading,batting_content.next().next(),function(){
												callback();
											})
										}else{
											console.log("opp team not found *******************")
											callback()
										}
									})
								}
							}
						}
					})
					
				}
			})
			
			
		}else{
			console.log("team not found ************")
			callback()
		}
	})
	// match_full_info.countries[country].match = {};
	
}
function getBowlingInfo(oppTeamId,heading,bowling_table,callback){
	// console.log(bowling_table.html())
	match_full_info.bowling_info.teamId = oppTeamId;
	var bowling_player_info = [];
	var j=0,n=bowling_table.find("tr").length;
	bowling_table.find("tr").each(function(){

		if($(this).hasClass("tr-heading")){
			j++;
			return
		}else if($(this).hasClass("dismissal-detail")){
			j++;
			return;
		}else{
			var tr_content = $(this);
			var cricPlayerId = $(this).find('td:nth-child(2) a').attr("href").split("/").pop().split(".")[0];
			db.Player_Profile.findOne({"otherInfo.cricPlayerId":cricPlayerId},{playerId:1,_id:0},function(err,playerDoc){
				if(playerDoc){
					var bowling_temp_score = {},bowler_info = {};bc = 3;
					bowler_info.playerId = playerDoc.playerId;
					var bowller_name = tr_content.find('td:nth-child(2) a').text();
					bowler_info.playerName = bowller_name;
					for(var b_info in bowling_stat){
						bowling_temp_score[b_info] = tr_content.find('td:nth-child('+ bc +')').text();
						bc++;
					}
					bowler_info.bowler_bowling_info = bowling_temp_score;
					bowling_player_info.push(bowler_info)
					j++;
					console.log("bowling " + j + " ********************** " + n)
					if(j == n){
						match_full_info.bowling_info.bowler_info = bowling_player_info;
						callback()
					}
				}else{
					j++
					if(j == n){
						match_full_info.bowling_info.bowler_info = bowling_player_info;
						callback()
					}
				}
			})
			
		}
	})
	// console.log(match_full_info.countries[country_name]);
	
}

exports.getFantasyPoints = function(matchId,callback){
	var fps = [];
	getFPPlayers(matchId,function(players){
		getFantasyIndex(matchId,function(fantasyIndex){
			var ic = 0,nic = players.length;
			for(var i=0;i<players.length;i++){
				(function(i){
					var playerId = players[i];
					var pfso = {};
					pfso.playerId = playerId;
					getPlayerName(playerId,function(playerName){
						pfso.playerName = playerName;
						calFantasyPoints(matchId,playerId,fantasyIndex,function(pts){
							// playerWisePoints["matchId_" + match]["playerId_" + playerId] = pts;
							console.log("playerId " + playerId + " points " + pts)
							pfso.points = pts;
							fps.push(pfso);
							ic++
							if(ic == nic)
								callback(fps)
						})
					})
					
				})(i)
			}
		})
		// console.log(players)
	})
	
}
function getPlayerName(playerId,callback){
  db.Player_Profile.findOne({playerId:playerId},{fullname:1,_id:0},function(err,playerName){
    if(err){
      console.log("error in getting player profile in getPlayerName function" + err)
    }else{
      if(playerName){
        callback(playerName.fullname)
      }
    }
  })
}
function getFantasyIndex(matchId,callback){
	client1.get("match_day_" + matchId,function(err,mresult){
		if(err)
			console.log("redis get error " + err)
		else{
			var fantasyIndex = mresult;
			callback(fantasyIndex);
		}
	})
}
function getFPPlayers(matchId,callback){
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
				          		players = players.concat(playersList);
				          	i++;
		          			if(i != ni)
		          				teamsLoop(i)
		          			if(i == ni)
		          				callback(players)
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
function calFantasyPoints(matchId,playerId,fantasyIndex,callback){
	var fic = 0,nfic = fantasyIndex,pts=0;
	for(var fi=fantasyIndex;fi>=0;fi--){
		(function(fi){
			client1.get("fantasyPoints_" + matchId + "_" + playerId + "_day_" + fantasyIndex,function(er,points){
				if(er){
					console.log("error in getting fantasy points");
				}else{
					if(points === null){
						callback(0);
					}else{
						pts += parseInt(points);
						nfic--;
						if(fic == nfic)
							callback(pts)
					}
					
				}

				
			})
		})(fi)
	}
}
