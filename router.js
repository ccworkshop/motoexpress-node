

var pages = require('./modules/pages');

var CT = require('./modules/country-list');
var AM = require('./modules/account-manager');
var EM = require('./modules/email-dispatcher');
var MM = require('./modules/motostore-manager');


module.exports = function(app) {

	console.log("router init");
	app.get("/",pages.index);
	app.get("/map",pages.map);
	app.get("/cusgeo",pages.cusgeo);
	app.get("/fixnote",pages.fixnote);


	app.get("/listAll",MM.listAll);
	app.get("/listNear/:latitude/:longitude/:distinct",MM.listNear);


	app.get("/store",pages.store);

	app.post('/store', function(req, res){

		MM.addStore({
			name 	: req.param('name'),
			address 	: req.param('address'),
			tel 	: req.param('tel'),
			description	: req.param('description'),
			latitude : req.param('latitude'),
			longitude : req.param('longitude')
		}, function(e){
			if (e){
				res.send(e, 400);
			}	else{
				res.send('ok', 200);
			}
		});
	});



	app.get('/login', function(req, res){

	// check if the user's credentials are saved in a cookie //
		if (req.cookies.user == undefined || req.cookies.pass == undefined){
			res.render('login', { title: 'Hello - Please Login To Your Account'});
		}	else{
	// attempt automatic login //
			AM.autoLogin(req.cookies.user, req.cookies.pass, function(o){
				if (o != null){
				  req.session.user = o;

				  console.log(o.user+" role "+o.role);

				  console.log(o.role=='USER');

				  if(o.role=='USER')
						res.redirect('/map');
					else if(o.role=='STORE')
						res.redirect('/cusgeo');

				}	else{
					res.render('login', {title: 'Hello - Please Login To Your Account' });
				}
			});
		}
	});
	
	app.post('/login', function(req, res){
		AM.manualLogin(req.param('user'), req.param('pass'), function(e, o){
			if (!o){
				res.send(e, 400);
			}	else{
			  req.session.user = o;
				if (req.param('remember-me') == 'true'){
					res.cookie('user', o.user, { maxAge: 900000 });
					res.cookie('pass', o.pass, { maxAge: 900000 });
				}

				if(o.role=='USER')
					res.send({redirect:"/map"}, 200);
				else if(o.role=='STORE')
					res.send({redirect:"/cusgeo"}, 200);
				
			}
		});
	});
	
// logged-in user homepage //
	
	app.get('/setting', function(req, res) {
		console.log(req.session.user);
    if (req.session.user == null){
// if user is not logged-in redirect back to login page //
        res.redirect('/login');
    }else{
			res.render('setting', {
				title : 'Control Panel',
				countries : CT,
				udata : req.session.user
			});
    }
	});
	
	app.post('/setting', function(req, res){

			AM.updateAccount({
				user 		: req.param('user'),
				name 		: req.param('name'),
				email 		: req.param('email'),
				country 	: req.param('country'),
				pass		: req.param('pass')
			}, function(e, o){
				if (e){
					res.send('error-updating-account', 400);
				}	else{

					
					req.session.user = o;
			// update the user's login cookies if they exists //
					if (req.cookies.user != undefined && req.cookies.pass != undefined){
						res.cookie('user', o.user, { maxAge: 900000 });
						res.cookie('pass', o.pass, { maxAge: 900000 });	
					}
					res.send('ok', 200);
				}
			});

	});

	app.post('/logout', function(req, res){
		res.clearCookie('user');
		res.clearCookie('pass');
		req.session.destroy(function(e){ res.send('ok', 200); });
	});


// creating new accounts //
	
	app.get('/signup',pages.signup);
	
	app.post('/signup', function(req, res){
		console.log("post signup");
		AM.addNewAccount({
			name 	: req.param('name'),
			email 	: req.param('email'),
			user 	: req.param('user'),
			pass	: req.param('pass'),
			country : req.param('country'),
			role: 'USER'
		}, function(e){
			if (e){
				res.send(e, 400);
			}	else{
				res.send('ok', 200);
			}
		});
	});

// password reset //

	app.post('/lost-password', function(req, res){
	// look up the user's account via their email //
		AM.getAccountByEmail(req.param('email'), function(o){
			if (o){
				res.send('ok', 200);
				EM.dispatchResetPasswordLink(o, function(e, m){
				// this callback takes a moment to return //
				// should add an ajax loader to give user feedback //
					if (!e) {
					//	res.send('ok', 200);
					}	else{
						res.send('email-server-error', 400);
						for (k in e) console.log('error : ', k, e[k]);
					}
				});
			}	else{
				res.send('email-not-found', 400);
			}
		});
	});

	app.get('/reset-password', function(req, res) {
		var email = req.query["e"];
		var passH = req.query["p"];
		AM.validateResetLink(email, passH, function(e){
			if (e != 'ok'){
				res.redirect('/');
			} else{
	// save the user's email in a session instead of sending to the client //
				req.session.reset = { email:email, passHash:passH };
				res.render('reset', { title : 'Reset Password' });
			}
		})
	});
	
	app.post('/reset-password', function(req, res) {
		var nPass = req.param('pass');
	// retrieve the user's email from the session to lookup their account and reset password //
		var email = req.session.reset.email;
	// destory the session immediately after retrieving the stored email //
		req.session.destroy();
		AM.updatePassword(email, nPass, function(o){
			if (o){
				res.send('ok', 200);
			}	else{
				res.send('unable to update password', 400);
			}
		})
	});

	app.get('/print', function(req, res) {
		AM.getAllRecords( function(e, accounts){
			res.render('print',  { title : 'Account List', accts : accounts } );
		})
	});
	
	app.post('/delete', function(req, res){
		AM.deleteAccount(req.body.id, function(e, obj){
			if (!e){
				res.clearCookie('user');
				res.clearCookie('pass');
	      req.session.destroy(function(e){ res.send('ok', 200); });
			}	else{
				res.send('record not found', 400);
			}
	    });
	});
	
	app.get('/reset', function(req, res) {
		AM.delAllRecords(function(){
			res.redirect('/print');	
		});
	});
		
	app.post('/apointStore', function(req, res){

		AM.apointStore(req.body, function(e){
			if (!e){
	      res.send({msg:'ok'}, 200);
			}	else{
				res.send('指定目標失敗', 400);
			}
	  });
	});

	app.get('/getApointStore/:account_id', function(req, res){
		var account_id = req.param("account_id");
		AM.getApointStore(account_id, function(e,o){
			if (!e){
	      res.send(o, 200);
			}	else{
				res.send({msg:'error'}, 400);
			}
	  });
	});
	
	app.get('/getHandleStore/:account_id', function(req, res) {
		var account_id = req.param("account_id");
		console.log(account_id);
		AM.getHandleStore(account_id,function(storedata){
			console.log(storedata);
			res.send(storedata, 200);
		});
	});

		app.get('/getApointUser/:store_id', function(req, res) {
			var store_id = req.param("store_id");
			console.log(store_id);
			AM.getApointUser(store_id,function(e, o){
				if (!e){
		      res.send(o, 200);
				}	else{
					res.send({msg:'error'}, 400);
				}
			});
		});

	app.get('/reset', function(req, res) {
		AM.delAllRecords(function(){
			res.redirect('/print');	
		});
	});

	
	// app.get('*', function(req, res) { res.render('404', { title: 'Page Not Found'}); });

};