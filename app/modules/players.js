var Foosball = require('../models/foosball');
var async = require('async');
module.exports = function(cb) {

	console.log('players module running');
	var players 			= [],
		player_prototype	= {},
		winner_found,
		loser_found,
		winner_index,
		loser_index;
		
	// ELO specific vars
	var win_expectancy,
		K = 24;
	
	Foosball.find({}).sort({when: 'asc'}).exec(
	function(err, matches) {

		if (err) {
			console.log(err);
		}	

		async.each(matches, function(match, callback){
				
			player_prototype 	= {},
			winner_found		= undefined,
			loser_found			= undefined;
			
			for (var index in players) {
			
				if (players[index]._id === match.winner) {
					players[index].wins++;
					winner_index = index;
					winner_found = true;
					
				}
				if (players[index]._id === match.loser) {
					players[index].losses++;
					loser_index = index;
					// players[index].rating = (players[index].wins / players[index].losses).toFixed(2);					
					loser_found = true;
				}
			}
			
			if ( !winner_found ) {
				player_prototype		= {};
				player_prototype._id	= match.winner;
				player_prototype.wins	= 1;
				player_prototype.losses	= 0;
				player_prototype.rating	= 1600; // ELO says new players start at 1600
				winner_index			= players.push(player_prototype) - 1;
			}
			
			if ( !loser_found ) {
				player_prototype		= {};
				player_prototype._id	= match.loser;
				player_prototype.wins	= 0;
				player_prototype.losses	= 1;
				player_prototype.rating	= 1600;	// ELO says new players start at 1600			
				loser_index				= players.push(player_prototype) - 1;
			}
			
			
			// ranking of winner
		
			win_expectancy = 0;
			win_expectancy = (1/(Math.pow(10,(players[loser_index].rating - players[winner_index].rating)/400)+1));	
			
			console.log('winner: ' + players[winner_index]._id + ' loser: ' + players[loser_index]._id);
			console.log('old winner rating: ' + players[winner_index].rating);
			console.log('new winner rating: ' + players[winner_index].rating + ' + (' + K + '(1 - ' + win_expectancy + '))');

			players[winner_index].rating = Math.floor(players[winner_index].rating + (K * (1 - win_expectancy)));

			
			// ranking of loser
			
			win_expectancy = 0;
			win_expectancy = (1/(Math.pow(10,(players[winner_index].rating - players[loser_index].rating)/400)+1));
			
			console.log('old loser rating: ' + players[loser_index].rating);
			console.log('new loser rating: ' + players[loser_index].rating + ' + (' + K + '(1 - ' + win_expectancy + '))');
			
			players[loser_index].rating = Math.floor(players[loser_index].rating + (K * (0 - win_expectancy)));
				
			callback();
		}, function (err) {
			cb(err, players);
			//console.log(players);
		});	
		
	});

};