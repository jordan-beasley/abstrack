var express = require('express');
var router = express.Router();
var moment = require('moment');
var MongoClient = require('mongodb').MongoClient;
require('dotenv/config');

router.get('/', function(req, res, next){
  
  try
  {
    MongoClient.connect(process.env.MONGO_SERVER, function(err, db){
      if(err) throw err;

      var dbo = db.db(process.env.MONGO_DB);

      try{
          dbo.collection(process.env.PLANNING_COLLECTION).findOne({}, {_id: 0})
          .then(function(results)
          {
              db.close();
              if(results != null && results != undefined)
              {
                  var date = moment(results.launch_date);
                  results.launch_date = date.format('MMM D');
                  res.render('index', {title: 'Arkansas Balloon', page: 'Home', active_home: true, plan: results });
              }else{
                res.render('index', {title: 'Arkansas Balloon', page: 'Home', active_home: true });
              }

          });
      }catch(err)
      {
          console.log(err);
          res.render('index', {title: 'Arkansas Balloon', page: 'Home', active_home: true });
      }
    });
  }catch(err)
  {
    console.log(err);
    res.render('index', {title: 'Arkansas Balloon', page: 'Home', active_home: true });   
  }

});

// using a seperate file for routes to handle actions specific to that route
var missions = require('../routes/missions');
router.use('/missions', missions);

var prediction = require('../routes/prediction');
router.use('/prediction', prediction);

var found = require('../routes/found');
router.use('/found', found);

var about = require('../routes/about');
router.use('/about', about);

var live = require('../routes/live');
router.use('/live', live);

var admin = require('../routes/admin');
router.use('/admin', admin);

var planning = require('../routes/planning');
router.use('/planning', planning);

var edit_missions = require('../routes/edit-missions');
router.use('/edit-missions', edit_missions);



// must be at the bottom, will take precedence over other views
router.get('*', function(req, res){
  res.render('error', {title: 'Error 404'});
});

module.exports = router;
