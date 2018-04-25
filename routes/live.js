var express = require('express');
var router = express.Router();
var moment = require('moment');
var MongoClient = require('mongodb').MongoClient;
require('dotenv/config');

var io = null;

router.get('/', function(req, res, next)
{
    try
    {
        // check for a currently active mission
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
    }catch(err)
    {
        console.log(err);
        res.render('live', {active_live: true});
    }
});


router.get('/coords', function(req, res, next)
{
    MongoClient.connect(process.env.MONGO_SERVER, function(err, db){
        if(err) throw err;

        var dbo = db.db(process.env.MONGO_DB);
        
        try
        {
            dbo.collection(process.env.FLIGHT_DATA_COLLECTION).find({}, {_id: 0, lat: 1, lon: 1})
            .sort({time_utc: 1})
            .toArray(function(err, results){
                if(err) throw err;

                //res.send(results);

                
                var index = 0;

                /*
                var interval = setInterval(function()
                {
                    var coord = results[index];
                    console.log('sending coord');
                    io.emit('testRET', {lat: coord.lat, lon: coord.lon});
                    if(index < results.length / 2)
                    {
                        index++;
                    }else{
                        clearInterval(interval);
                    }
                }, 500);*/

                res.send({success: {ok: 1}});
            });
        }catch(err)
        {
            console.log(err);
        }
    });
});

router.get('/live-altitude', function(req, res, next)
{
    
    MongoClient.connect(process.env.MONGO_SERVER, function(err, db){
        if(err) throw err;

        var dbo = db.db(process.env.MONGO_DB);
        
        try{
            dbo.collection(process.env.FLIGHT_DATA_COLLECTION).find({}, { _id: 0, time_utc: 1, alt_m: 1, alt_ft: 1, date: 1}).sort({time_utc: 1})
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

router.post('/m/flightdata', function(req, res)
{
    console.log('body: ', req.body);
    
    if(req.body)
    {
        var buffer = Buffer.from(req.body.data, 'hex').toString('utf8');
        var data = buffer.split(',');
        
        
        //(imei, momsn, transmit_time UTC, iridium_latitude, 
        //  iridium_longitude, iridium_cep, data hex-encoded)
        // [lat, lon, alt_m, alt_ft, v_vel_ms, v_vel_ms
        var imei = req.body.imei;
        var date = moment(req.body.transmit_time, 'YY-DD-MM hh:mm:ss').format('MM/DD/YYYY');
        var time = moment(req.body.transmit_time, 'YY-DD-MM hh:mm:ss').format('HH:mm:ss');;
        var lat = Number.parseFloat(data[0]);
        var lon = Number.parseFloat(data[1]);
        var alt_m = Number.parseFloat(data[2]);
        var alt_ft = Number.parseFloat(data[3]);
        var v_vel_ms = Number.parseFloat(data[4]);
        var v_vel_ft = Number.parseFloat(data[5]);

        console.log('date', date);
        console.log('imei: ', imei);
        console.log('time_utc: ', time);
        console.log('lat: '+ lat + ', lon: ' + lon);
        
        
        var io = req.app.get('socketio');
    
        if(io)
        {
            console.log('sending');
            io.emit('flight-data-gps', {lat: lat, lon: lon});
        }

    }

    res.send({status: 'recieved'});

    /*
    MongoClient.connect(process.env.MONGO_SERVER, function(err, db){
        if(err) throw err;

        var dbo = db.db(process.env.MONGO_DB);
        
        try{
            dbo.collection(process.env.FLIGHT_DATA_COLLECTION).find({}, { _id: 0, time_utc: 1, alt_m: 1, alt_ft: 1, date: 1}).sort({time_utc: 1})
            .toArray(function(err, result){
                if(err) throw err;
                res.send(result);
            });
        }catch(err)
        {
            console.log(err);
        }
    });*/
});

module.exports = router;
