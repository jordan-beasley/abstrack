var express = require('express');
var app = express();
var router = express.Router();

router.get('/', function(req, res, next){
  res.render('index', {title: 'Arkansas Ball'});
});

/*
app.get('/missions', function(req, res, next){
  res.render('missions');
});

app.get('/prediction', function(req, res, next){
  res.render('prediction');
});

app.get('/recovery', function(req, res, next){
  res.render('recovery');
});

app.get('/found', function(req, res, next){
  res.render('found');
});
*/

/*app.get('/about', function(req, res, next){
  res.render('about');
});*/



// must be at the bottom, will take precedence over other views
router.get('*', function(req, res){
  res.send('<h1>Error Page Not Found</h1>');
});

module.exports = router;
