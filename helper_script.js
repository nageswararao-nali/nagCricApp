exports.player = {
	statistic_fields : {
		"Matches" : null,
		"Innings" : null,
		"NotOuts" : null,
		"Runs" : null,
		"HighScore" : null,
		"Average" : null,
		"BallsFaced" : null,
		"StrikeRate" : null,
		"Hundreds" : null,
		"Fifties" : null,
		"Fours" : null,
		"Sixes" : null,
		"Catches" : null,
		"Stumpings" : null
	},
	bowling_statistic_fields : {
		"Matches" : null,
		"Innings" : null,
		"Balls" : null,
		"Runs" : null,
		"Wickets" : null,
		"BestInnings" : null,
		"BestMatches" : null,
		"BowlingAverage" : null,
		"EconomyRate" : null,
		"StrikeRate" : null,
		"FourWickets" : null,
		"FiveWickets" : null,
		"TenWickets" : null,
		"Maidens" : null
	}
}
exports.scoreboard = {
	all_matches : {},
	bowling_stat : {
		Overs : null,
		Maidens : null,
		Runs : null,
		Wickets : null,
		EconemyRates : null,
		DotBalls : null,
		Fours : null,
		sixes : null
	},
	batting_score : {
		Comment : null,
		Runs : null,
		Minutes : null,
		Balls : null,
		fours : null,
		sixes : null,
		StrikeRate : null
	},
	match_full_info : {
		match_name : null,
		countries : {}
	}
}
exports.scoreboard1 = {
	all_matches : {},
	bowling_stat : {
		Overs : null,
		Maidens : null,
		Runs : null,
		Wickets : null,
		EconemyRates : null,
		DotBalls : null,
		Fours : null,
		sixes : null
	},
	batting_score : {
		Comment : null,
		Runs : null,
		Minutes : null,
		Balls : null,
		fours : null,
		sixes : null,
		StrikeRate : null
	},
	match_full_info : {
		matchId : null,
		match_name : null,
		match_type : null,
		match_batting_player : null,
		match_batting_runner : null,
		match_bowler : null,
		extras : null,
		total : null,
		batting_info : {},
		bowling_info : {}
	}
}