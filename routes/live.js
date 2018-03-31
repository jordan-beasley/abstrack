var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
require('dotenv/config');

router.get('/', function(req, res, next){
    MongoClient.connect(process.env.MONGO_SERVER, function(err, db){
        if(err) throw err;

        var dbo = db.db(process.env.MONGO_DB);
        // check for upcoming launches
        dbo.collection(process.env.FLIGHT_DATA_COLLECTION).findOne({}, function(err, result){
            if(err) throw err;
            db.close();
        });
    });
    res.render('live', {active_live: true});
});


router.get('/liveupdate', function(req, res, next){
    MongoClient.connect(process.env.MONGO_SERVER, function(err, db){
        if(err) throw err;

        var dbo = db.db(process.env.MONGO_DB);
        
        try{
            dbo.collection(process.env.FLIGHT_DATA_COLLECTION).find({}, {lat: 1, lon: 1}).sort({time_utc: 1})
            .toArray(function(err, result){
                if(err) throw err;
                res.send(result);
            });
        }catch(err)
        {
            console.log(err);
        }
    });
});

module.exports = router;
