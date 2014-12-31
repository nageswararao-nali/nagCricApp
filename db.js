var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/mydatabase',function(err, db){
	if(err)
		console.log(err)
	else
		console.log(db)
});

exports.Match_Shedule = mongoose.model('Match_Shedule' , {
		"matchId" : Number,
		"otherInfo" : Object,
		"mtype" : String,
		"series_id" : String,
		"series_name" : String,
		"MatchNo" : String,
		"StartDate" : Date,
		"EndDate" : Date,
		"team1" : Object,
		"team2" : Object

	})
exports.Team_Info = mongoose.model('Team_Info' , {
		"teamId" : Number,
		"teamName" : String,
		"teamShortName" : String,
		"teamLogoPath" : String,
        "teamLogoSmallPath" : String,
        "teamFlagPath" : String,
        "teamSmallFlagPath" : String,
        "teamRoundFlagPath" : String,
        "teamSmallRoundFlagPath" : String,
        "teamLargeRoundFlagPath" : String,
        "players" : Array

	})
exports.Player_Profile = mongoose.model('Player_Profile' , {
		"playerId" : Number,
		"pic_url" : String,
		"image" : String,
		"otherInfo" : Object,
		"teamId" : Number,
		"firstName" : String,
		"lastName" : String,
		"country" : String,
		"fullname": String,
		"batting_info" : Object,
		"bowling_info" : Object,
		"approved" : Number // 0-non,1-level1 approve,2-need to update,3-approved
	})
exports.Player_Profile_Updation = mongoose.model('Player_Profile_Updation' , {
		"playerId" : Number,
		"otherInfo" : Object,
		"updated" : Number // 0-non,1-updated
	},"Player_Profile_Updation")
exports.MatchPlayers = mongoose.model('MatchPlayers' , {
		"matchId" : Number,
		"teams" : Array
})
exports.MatchScoreCard = mongoose.model('MatchScoreCard' , {
		"matchId" : Number,
		"scorecard" : Object
})
exports.News = mongoose.model('News' , {
		"newsId" : String,
		"pubDate" : String,
		"link" : String,
		"title" : String,
		"description" : String,
		"content" : String
})
exports.Player_Bid_Info = mongoose.model( 'Player_Bid_Info',{
         "matchId": String,
         "playerId" : Number,
         "bidInfo" : Array,
         "fantasyPoints": Array
},"Player_Bid_Info");
exports.Notifications = mongoose.model( 'Notifications',{
         "user": String,
         "message" : String,
         "createDate" : Date,
},"Notifications");
var Schema   = mongoose.Schema;
var userSchema = new Schema({
        _id : String,
        FBNAME : String,
        FBPIC:String,
        FBCITY:String,
        FBCOUNTRY:String,
        deviceToken:String,
        EMAIL : String,
        Credits : Number,
        FriendsList : Array
});
 var userSchemacol = "userSchema"
exports.userSchema = mongoose.model( 'userSchema', userSchema, userSchemacol );
