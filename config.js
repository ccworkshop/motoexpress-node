var stylus = require("stylus"), 
    nib = require("nib");
module.exports = function(app, express, path) {

  app.configure(function(){
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser('your secret here'));
    app.use(express.session());

    app.use(function(req, res, next) {
      res.locals.session = req.session
      next();
    });

    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));
  });


  app.configure('development', function(){
    app.locals.pretty = true;

    var stylusMiddleware = stylus.middleware({
    src: __dirname + '/public/', // .styl files are located in `/stylus`
    dest: __dirname + '/public/', // .styl resources are compiled `/css/*.css`
    debug: true,
    force: true,
    compile: function(str, path) { // optional, but recommended
      return stylus(str)
        .set('filename', path)
        .set('warn', true)
        .set('compress', true)
        .use(nib());
      }
    });
    app.use(stylusMiddleware);  

    app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
  });


  app.all('*', function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
  });
	
}