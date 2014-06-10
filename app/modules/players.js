var Foosball = require('../models/foosball');
var async = require('async');
var moment = require('moment');
module.exports = function(cb) {

	console.log('players module running');

	var returndata			= {},
		processed_matches	= [],
		match_prototype		= {},
		players 			= [],
		player_prototype	= {},
		calculated_matches	= [],
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
					loser_found = true;
				}
			}

			if ( !winner_found ) {
				player_prototype		= {};
				player_prototype._id	= match.winner;
				player_prototype.wins	= 1;
				player_prototype.losses	= 0;
				player_prototype.rating	= 1600; // ELO says new players start at 1600
				player_prototype.highest= 1600;
				player_prototype.lowest	= 1600;
				winner_index			= players.push(player_prototype) - 1;
			}

			if ( !loser_found ) {
				player_prototype		= {};
				player_prototype._id	= match.loser;
				player_prototype.wins	= 0;
				player_prototype.losses	= 1;
				player_prototype.rating	= 1600;	// ELO says new players start at 1600
				player_prototype.highest= 1600;
				player_prototype.lowest	= 1600;
				loser_index				= players.push(player_prototype) - 1;
			}


			match_prototype						= {};
			match_prototype.when				= match.when;
			match_prototype.when_pretty 		= moment(match.when).fromNow();
			match_prototype.winner 				= match.winner;
			match_prototype.winner_oldrating	= players[winner_index].rating;
			match_prototype.loser 				= match.loser;
			match_prototype.loser_oldrating		= players[loser_index].rating;

			// ranking of winner

			win_expectancy = 0;
			win_expectancy = (1/(Math.pow(10,(players[loser_index].rating - players[winner_index].rating)/400)+1));
			players[winner_index].rating = players[winner_index].rating + (K * (1 - win_expectancy));


			// ranking of loser

			win_expectancy = 0;
			win_expectancy = (1/(Math.pow(10,(players[winner_index].rating - players[loser_index].rating)/400)+1));
			players[loser_index].rating = players[loser_index].rating + (K * (0 - win_expectancy));

			match_prototype.winner_newrating	= players[winner_index].rating;
			match_prototype.loser_newrating 	= players[loser_index].rating;

			if (players[winner_index].rating > players[winner_index].highest){
				players[winner_index].highest = players[winner_index].rating;
			}


			if (players[winner_index].rating < players[winner_index].lowest){
				players[winner_index].lowest = players[winner_index].rating;
			}

			if (players[loser_index].rating > players[loser_index].highest){
				players[loser_index].highest = players[loser_index].rating;
			}


			if (players[loser_index].rating < players[loser_index].lowest){
				players[loser_index].lowest = players[loser_index].rating;
			}

			processed_matches.push(match_prototype);

			callback();
		}, function (err) {

			var o = 0;

			for (var index_a in players) {

				console.log('loop a, player: ' + index_a);

				for (var index_b in players) {

					console.log('loop b, player: ' + index_b);

					if (players[index_a]._id != players[index_b]._id) {

						match_prototype = {};
						match_prototype.winner = players[index_a]._id;
						match_prototype.loser = players[index_b]._id;

						// estimated ranking of winner
						win_expectancy = 0;
						win_expectancy = (1/(Math.pow(10,(players[index_b].rating - players[index_a].rating)/400)+1));
						match_prototype.winner_rating = players[index_a].rating + (K * (1 - win_expectancy));

						// estimated ranking of loser

						win_expectancy = 0;
						win_expectancy = (1/(Math.pow(10,(players[index_a].rating - players[index_b].rating)/400)+1));
						match_prototype.loser_rating = players[index_b].rating + (K * (0 - win_expectancy));

						calculated_matches.push(match_prototype);

					}
				}

				o++;

				if (o == players.length) {

					returndata.players = players;
					returndata.matches = processed_matches;
					returndata.calculated_matches = calculated_matches;
					cb(err, returndata);

				}
			}

		});

	});

};
