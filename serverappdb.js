var mongoose = require( 'mongoose' );
mongoose.connect( 'mongodb://localhost/cricapp' );
var Schema   = mongoose.Schema;
var Schema1   = mongoose.Schema;
var Schema2   = mongoose.Schema;
var Schema3   = mongoose.Schema;
var Schema4   = mongoose.Schema;
var Schema5  = mongoose.Schema;
 
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


var Match_Schedule = new Schema1({
          matchId : Number, 
          mtype : String, 
          series_id : String, 
          series_name : String, 
          MatchNo : String, 
          StartDate : String, 
          EndDate : String, 
          team1 : Object, 
          team2 : Object
});
 var MatchSchedulecol = "Match_Schedule"
exports.Match_Schedule = mongoose.model( 'Match_Shedule', Match_Schedule, MatchSchedulecol );


var Team_Info = new Schema2({
         teamId : Number, 
         teamName : String, 
         teamShortName : String, 
         teamLogoPath : String, 
         teamLogoSmallPath : String, 
         teamFlagPath : String, 
         teamSmallFlagPath : String, 
         teamRoundFlagPath : String, 
         teamSmallRoundFlagPath : String, 
         teamLargeRoundFlagPath : String, 
         players : Array
});
 var Team_Infocol = "Team_Info"
exports.Team_Info = mongoose.model( 'Team_Info', Team_Info, Team_Infocol );


var Player_Info = new Schema3({
           playerId : Number, 
           teamId : Number, 
           firstName : String, 
           lastName : String, 
           country : String, 
           fullname: String, 
           batting_info : Object, 
           bowling_info : Object 
});
 var Player_Infocol = "Player_Info"
exports.Player_Info = mongoose.model( 'Player_Info', Player_Info, Player_Infocol );


var Player_Bid_Info = new Schema4({
         matchId: String,
         playerId : Number,
         bidInfo : Array,
         fantasyPoints: Array
});
 var Player_Bid_Infocol = "Player_Bid_Info"
exports.Player_Bid_Info = mongoose.model( 'Player_Bid_Info', Player_Bid_Info, Player_Bid_Infocol );


var Match_Players = new Schema5({
         matchId: Number,
         teams : Object
         
});
 var Match_Playerscol = "Match_Players"
exports.Match_Players = mongoose.model( 'Match_Players', Match_Players, Match_Playerscol );

exports.Leagues_Info = mongoose.model("Leagues_Info",{
  leagueName : String,
  matchId : Number,
  createdBy : String,
  users : Array
},"Leagues_Info")


 

 


