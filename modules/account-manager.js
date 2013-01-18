
var crypto 		= require('crypto')

var moment 		= require('moment');

var stores = require('../modules/util/stores');

/* establish the database connection */


var accounts = stores.accounts;
/* login validation methods */

exports.autoLogin = function(user, pass, callback)
{
	accounts.findOne({user:user}, function(e, o) {
		if (o){
			o.pass == pass ? callback(o) : callback(null);
		}	else{
			callback(null);
		}
	});
}

exports.manualLogin = function(user, pass, callback)
{
	accounts.findOne({user:user}, function(e, o) {
		if (o == null){
			callback('user-not-found');
		}	else{
			validatePassword(pass, o.pass, function(err, res) {
				if (res){
					callback(null, o);
				}	else{
					callback('invalid-password');
				}
			});
		}
	});
}

/* record insertion, update & deletion methods */

exports.addNewAccount = function(newData, callback)
{
	accounts.findOne({user:newData.user}, function(e, o) {
		if (o){
			callback('username-taken');
		}	else{
			accounts.findOne({email:newData.email}, function(e, o) {
				if (o){
					callback('email-taken');
				}	else{
					saltAndHash(newData.pass, function(hash){
						newData.pass = hash;
					// append date stamp when record was created //
						newData.date = moment().format('MMMM Do YYYY, h:mm:ss a');

						newData.role = "USER";
					  newData.targetstore_id = "";
					  newData.latitude = -1;
					  newData.longitude = -1;

						var account=new stores.accounts(newData);

						console.log(account);

						account.save(function(err) {
							if (err) {
								console.log(err);
							} else {
								callback();
							}
						}); 


						// accounts.insert(newData, {safe: true}, callback);
					});
				}
			});
		}
	});
}

exports.updateAccount = function(newData, callback)
{
	accounts.findOne({user:newData.user}, function(e, o){
		o.name 		= newData.name;
		o.email 	= newData.email;
		o.country 	= newData.country;
		if (newData.pass == ''){
			o.save(function(err) {
					if (err) {
						console.log(err);
					} else {
						callback(err,o);
					}
			}); 
		}	else{
			saltAndHash(newData.pass, function(hash){
				o.pass = hash;
				o.save(function(err) {
					if (err) {
						console.log(err);
					} else {
						callback(err,o);
					}
				});
			});
		}
	});
}

exports.updatePassword = function(email, newPass, callback)
{
	accounts.findOne({email:email}, function(e, o){
		saltAndHash(newPass, function(hash){
			console.log(o);
			o.pass = hash;
			console.log(o);

			o.save(function(err) {
					if (err) {
						console.log(err);
					} else {
						callback(o);
					}
			}); 
		});
	});
}

/* account lookup methods */

exports.deleteAccount = function(id, callback)
{
	console.log("deleteAccount id="+id);
	accounts.findOne({_id:id}, function(e, o){
		o.remove(function(err) {
				if (err) {
					console.log(err);
				} else {
					callback(err,o);
				}
		}); 
	});
}

exports.getAccountByEmail = function(email, callback)
{
	accounts.findOne({email:email}, function(e, o){ callback(o); });
}

exports.validateResetLink = function(email, passHash, callback)
{
	accounts.find({ $and: [{email:email, pass:passHash}] }, function(e, o){
		callback(o ? 'ok' : null);
	});
}

exports.getAllRecords = function(callback)
{
	accounts.find().toArray(
		function(e, res) {
		if (e) callback(e)
		else callback(null, res)
	});
};

exports.delAllRecords = function(callback)
{
	accounts.remove({}, callback); // reset accounts collection for testing //
}

exports.apointStore = function(fixdata, callback)
{
  accounts.findOne({_id:fixdata.account_id}, function(user_e, user_o) {
    stores.motostores.findOne({_id:fixdata.store_id}, function(store_e, store_o) {

      if (user_o && store_o){
        user_o.latitude= fixdata.latitude;
        user_o.longitude= fixdata.longitude;
        user_o.targetstore_id= fixdata.store_id;


				user_o.save(function(err) {
					callback(err);
				});
      } else{
        if(user_e)callback(user_e);
        else callback(store_e);
      }
    });
  });
}

exports.getHandleStore= function(userid,callback){
	stores.motostores.findOne({account_id:userid}, function(store_e, store_o) {

      callback(store_o);
  });

}

exports.getApointUser= function(storeid,callback){
	accounts.find({targetstore_id:storeid}, function(e, o) {

      callback(e, o);
  });

}

exports.getApointStore= function(userid,callback){
  accounts.findOne({_id:userid}, function(user_e, user_o) {
    stores.motostores.findOne({_id:user_o.targetstore_id}, function(store_e, store_o) {
      callback(store_e,store_o);
 
    });
  });

}





/* private encryption & validation methods */

var generateSalt = function()
{
	var set = '0123456789abcdefghijklmnopqurstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ';
	var salt = '';
	for (var i = 0; i < 10; i++) {
		var p = Math.floor(Math.random() * set.length);
		salt += set[p];
	}
	return salt;
}

var md5 = function(str) {
	return crypto.createHash('md5').update(str).digest('hex');
}

var saltAndHash = function(pass, callback)
{
	var salt = generateSalt();
	callback(salt + md5(pass + salt));
}

var validatePassword = function(plainPass, hashedPass, callback)
{
	var salt = hashedPass.substr(0, 10);
	var validHash = salt + md5(plainPass + salt);
	callback(null, hashedPass === validHash);
}

/* auxiliary methods */

var getObjectId = function(id)
{
	return accounts.db.bson_serializer.ObjectID.createFromHexString(id)
}

var findById = function(id, callback)
{
	accounts.findOne({_id: getObjectId(id)},
		function(e, res) {
		if (e) callback(e)
		else callback(null, res)
	});
};


var findByMultipleFields = function(a, callback)
{
// this takes an array of name/val pairs to search against {fieldName : 'value'} //
	accounts.find( { $or : a } ).toArray(
		function(e, results) {
		if (e) callback(e)
		else callback(null, results)
	});
}
