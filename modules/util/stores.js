var mongoose = require('mongoose');

mongoose.connect('mongodb://smlsun:sunsml@ds047387.mongolab.com:47387/datacloud');

var Schema = mongoose.Schema
  , ObjectId = Schema.ObjectId;

var motostoresSchema = new Schema({
  name : String,
  description : String,
  address : String,
  latitude : Number,
  longitude : Number,
  tel : String ,
  show : String 
});
var accountsSchema = new Schema({
	name 	: String,
	email : String,
	user 	: String,
	pass	: String,
	country : String,
});


var motostores = mongoose.model('motostores', motostoresSchema);
var accounts = mongoose.model('accounts',accountsSchema);

exports.motostores = motostores;
exports.accounts = accounts;

