var Foosball = require('../models/foosball');
var async 	 = require('async');
var moment 	 = require('moment');

module.exports = function (cb) {
	// use mongoose to get all matches in the database
	Foosball.find({}).sort({when: -1}).exec(
	function(err, matches) {

		if (err) {
			console.log(err);
			res.send(err)
		}	

		async.each(matches, function(match, callback){
			match.when_pretty = moment(match.when).fromNow();
			callback();
		}, function (err) {
			cb(err, matches);
		});	
		
	});
};