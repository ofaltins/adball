var Foosball = require('../models/foosball');
var async = require('async');
module.exports = function(algorithm, cb) {
	async.parallel([

	function(callback) {
		var agg_winners = [{
			$group: {
				_id: "$winner",
				total: {
					$sum: 1
				}
			}
		}];
		Foosball.aggregate(agg_winners, function(err, winners) {
			callback(err, {
				'w': winners
			});
		});
	}, function(callback) {
		var agg_losers = [{
			$group: {
				_id: "$loser",
				total: {
					$sum: 1
				}
			}
		}];
		Foosball.aggregate(agg_losers, function(err, losers) {
			callback(err, {
				'l': losers
			});
		});
	}],
	// optional callback

	function(err, results) {
		for (var k in results) {
			if (results[k].w !== undefined) {
				var w = results[k].w;
			} else {
				var l = results[k].l;
			}
		}
		var player_prototype = [],
			players			 = [],
			y = 0;
		async.each(w, function(temp_player, callback) {
			// each winner
			found = undefined;
			player_prototype = [];
			player_prototype._id = temp_player._id;
			player_prototype.wins = temp_player.total;
			for (y; y < l.length; y++) {
				// each loser
				if (temp_player._id === l[y]._id) {
					// a winner is found in the loser list
					player_prototype.losses = l[y].total;
					found = true;
					break;
				}
			}
			if (!found) {
				player_prototype.losses = 0;
				players.push(player_prototype);
			}
			callback();
		}, function(err) {
			//cb(err, players);
			console.log(players);
		});
	});
};