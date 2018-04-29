var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var hbs = require('express-handlebars');

var app = express();
app.use(express.static(path.join(__dirname, './public')));

// view engine setup
app.engine('hbs', hbs({
            extname: 'hbs',
            helpers: require('./helpers/handlebars.js'),
            layoutsDir: __dirname + '/views/layouts/',
            defaultLayout: 'layout',
            partialsDir: __dirname + '/views/partials/'
          }));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

var routes = require('./routes');
app.use('/', routes);

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


var server = app.listen(8080, function(){
  console.log('Listening on port 8080');
});

var io = require('socket.io')(server);
app.set('socketio', io);

module.exports = app;
