var db = require('./db');
var cheer = require('cheerio');
var request = require('request');
exports.getMaidens = function(player_name,callback){
	var player_name = player_name;
	player_name.trim();
	var formData = {
	  searchkeyword: player_name,
	};
	request.post({url:'http://cricketarchive.com/cgi-bin/search2.cgi', formData: formData,followAllRedirects: true}, function(err, httpResponse, html) {
	  if (err) {
	    console.error('upload failed:', err);
	    // callback(0);
	  }else{
	  	$ = cheer.load(html);
	  	$("#columnLeft table").each(function(){
	  		var match_type_content = $(this).find("tr").eq(0).find("td b").text();
			if((match_type_content.indexOf("Twenty20") != -1) && (match_type_content.indexOf("Bowling") != -1) && (match_type_content.indexOf("International") == -1)){
				var madins = $(this).find("tr").eq(2).find("td").eq(2).text();
				callback(madins);
			}else{
				// callback(0);
			}
	  	})
	  }
	  // res.write("body starts here -------------");
	  
	});
}
