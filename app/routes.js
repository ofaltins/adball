// load the model
var Foosball = require('./models/foosball');
var async 	 = require('async');
var moment 	 = require('moment');


// expose the routes to app
module.exports = function(app) {

	// api ---------------------------------------------------------------------

	// get all players and matches
	app.get('/api/players', function(req, res) {

		require('./modules/players')(function (err, players) {
			if (err) {
				res.send(err);
			} else {
				res.json(players);
			}
		});
	  
	});
	

	// create match and send back all matches after creation
	app.post('/api/matches', function(req, res) {

		// create a todo, information comes from AJAX request from Angular
		Foosball.create({
			winner : req.body.winner.toLowerCase(),
			loser : req.body.loser.toLowerCase()			
		}, function(err, match) {
			if (err) {
				res.send(err);
			}

			// get and return all the players and matches after match created
			require('./modules/players')(function (err, players) {
				if (err) {
					res.send(err);
				} else {
					res.json(players);
				}
			});
					
			
		});

	});

};
