var Foosball = require('../models/foosball');
var async = require('async');
module.exports = function(cb) {

	console.log('players module running');
	var players 			= [],
		player_prototype	= {},
		winner_found 		= undefined,
		loser_found			= undefined;
	
	Foosball.find({}).sort({when: -1}).exec(
	function(err, matches) {

		if (err) {
			console.log(err);
		}	

		async.each(matches, function(match, callback){
		
			console.log('async loop running');
		
			player_prototype 	= {},
			winner_found		= undefined,
			loser_found			= undefined;
			
			for (var index in players) {
			
				if (players[index]._id === match.winner) {
					players[index].wins++;
					players[index].rating = (players[index].wins / players[index].losses).toFixed(2);
					winner_found = true;
					
				}
				if (players[index]._id === match.loser) {
					players[index].losses++;
					players[index].rating = (players[index].wins / players[index].losses).toFixed(2);					
					loser_found = true;
				}
			}
			
			if ( !winner_found ) {
				player_prototype		= {};
				player_prototype._id	= match.winner;
				player_prototype.wins	= 1;
				player_prototype.losses	= 0;
				player_prototype.rating	= 0;
				players.push(player_prototype);
			}
			
			if ( !loser_found ) {
				player_prototype		= {};
				player_prototype._id	= match.loser;
				player_prototype.wins	= 0;
				player_prototype.losses	= 1;
				player_prototype.rating	= 0;				
				players.push(player_prototype);					
			}
				
				
			callback();
		}, function (err) {
			cb(err, players);
			//console.log(players);
		});	
		
	});

};