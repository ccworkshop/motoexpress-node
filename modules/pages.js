var CT = require('../modules/country-list');

exports.index = function(req, res){
  res.render('index', { title: 'index' });
};

exports.map = function(req, res){
  res.render('map', { title: 'map' });
};

exports.fixnote = function(req, res){

	if(req.session.user==null)
		res.redirect('/login');
  else res.render('fixnote', { title: 'fixnote' });
};

exports.signup = function(req, res) {
	res.render('signup', {  title: 'Signup',countries : CT });
}

exports.addstore = function(req, res) {
	res.render('addstore', {  title: 'addstore'});
}


