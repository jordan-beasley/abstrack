var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
require('dotenv/config');

router.get('/', function(req, res, next){
    console.log(process.env.MONGO_SERVER);
    MongoClient.connect(process.env.MONGO_SERVER, function(err, db){
        if(err) throw err;

        var dbo = db.db(process.env.MONGO_DB);

        dbo.collection(process.env.FLIGHT_DATA_COLLECTION).findOne({}, function(err, result){
            if(err) throw err;
            console.log(result.mission_id);
            db.close();
        });
    });
    res.render('live', {active_live: true});
});

module.exports = router;