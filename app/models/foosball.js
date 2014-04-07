// load mongoose since we need it to define a model
var mongoose = require('mongoose');

module.exports = mongoose.model('Foosball', {
	winner		: String,
	loser		: String,
	when		: { type : Date, default: Date.now },
	when_pretty : String
});