var express = require('express');
var router = express.Router();
var moment = require('moment');
var MongoClient = require('mongodb').MongoClient;
require('dotenv/config');

router.get('/', function(req, res, next)
{
    try
    {
        /*
        // check for a currently active mission
        MongoClient.connect(process.env.MONGO_SERVER, function(err, db){
            if(err) throw err;

            var dbo = db.db(process.env.MONGO_DB);
            // check for upcoming launches
            dbo.collection(process.env.FLIGHT_DATA_COLLECTION)
            .findOne({}, function(err, result){
                if(err) throw err;
                db.close();
            });
        });*/

        res.render('live', {active_live: true});
    }catch(err)
    {
        console.log(err);
        res.render('live', {active_live: true});
    }
});


router.get('/coords', function(req, res, next)
{
    try
    {
        MongoClient.connect(process.env.MONGO_SERVER, function(err, db){
            if(err) throw err;

            var dbo = db.db(process.env.MONGO_DB);
            
            try
            {
                dbo.collection(process.env.PLANNING_COLLECTION).findOne({}, {_id: 0})
                .then(function(results)
                {
                    var mission_id = Number.parseInt(results.mission_id);
                    try
                    {
                        dbo.collection(process.env.FLIGHT_DATA_COLLECTION)
                        .find({mission_id: mission_id}, {_id: 0, lat: 1, lon: 1})
                        .sort({time_utc: 1})
                        .toArray(function(err, results){
                            if(err) throw err;
                            
                            res.send(results);
                        });
                    }catch(err)
                    {
                        console.log(err);
                        res.send({});
                    }
                });
            }catch(err)
            {
                console.log(err);
                res.send({});
            }
        });
    }catch(err)
    {
        console.log(err);
    }
});

router.get('/live-altitude', function(req, res, next)
{
    
    MongoClient.connect(process.env.MONGO_SERVER, function(err, db){
        if(err) throw err;

        var dbo = db.db(process.env.MONGO_DB);
        
        try
        {
            dbo.collection(process.env.PLANNING_COLLECTION).findOne({}, {_id: 0})
            .then(function(results)
            {
                
                if(results != null && results != undefined)
                {
                    var mission_id = Number.parseInt(results.mission_id);
                    try
                    {
                        dbo.collection(process.env.FLIGHT_DATA_COLLECTION)
                        .find({mission_id: mission_id}, { _id: 0, time_utc: 1, alt_m: 1, alt_ft: 1})
                        .sort({time_utc: 1})
                        .toArray(function(err, result){
                            if(err) throw err;
                            res.send(result);
                        });
                    }catch(err)
                    {
                        console.log(err);
                        res.send({});
                    }
                }
            });
        }catch(err)
        {
            console.log(err);
        }
    });
});

router.post('/m/flightdata', function(req, res)
{
    
    if(req.body)
    {
        //(imei, momsn, transmit_time UTC, iridium_latitude, 
        //  iridium_longitude, iridium_cep, data hex-encoded)
        var buffer = Buffer.from(req.body.data, 'hex').toString('utf8');
        var data = buffer.split(',');
        
        var imei = req.body.imei;
        var date = moment(req.body.transmit_time, 'YY-DD-MM hh:mm:ss').format('MM/DD/YYYY');
        var time_utc = moment(req.body.transmit_time, 'YY-DD-MM hh:mm:ss').format('HH:mm:ss');;
        var lat = Number.parseFloat(data[0]);
        var lon = Number.parseFloat(data[1]);
        var alt_m = Number.parseFloat(data[2]);
        var alt_ft = Number.parseFloat(data[3]);
        var v_vel_ms = Number.parseFloat(data[4]);
        var v_vel_ft = Number.parseFloat(data[5]);
        
        var io = req.app.get('socketio');
    
        if(io)
        {
            io.emit('flight-data-gps', {lat: lat, lon: lon});
            io.emit('flight-data-alt', {time_utc: time_utc, alt_m: alt_m, alt_ft: alt_ft});
            io.emit('flight-data-vel', {time_utc: time_utc, v_vel_ms: v_vel_ms, v_vel_ft: v_vel_ft});
        }

    }

    MongoClient.connect(process.env.MONGO_SERVER, function(err, db){
        if(err) throw err;

        var dbo = db.db(process.env.MONGO_DB);
        
        try
        {
            var mission_id = -1;
            var timestamp = moment(Date.now()).format('YYYY-MM-DD');

            dbo.collection(process.env.PLANNING_COLLECTION).findOne({}, {_id: 0})
            .then(function(results)
            {
                
                if(results != null && results != undefined)
                {
                    mission_id = Number.parseInt(results.mission_id);
                }
                
                dbo.collection(process.env.FLIGHT_DATA_COLLECTION)
                .insertOne({
                    mission_id : mission_id,
                    imei : imei,
                    date : date,
                    time_utc : time_utc,
                    lat : lat,
                    lon : lon,
                    alt_m : alt_m,
                    alt_ft : alt_ft,
                    v_vel_ms : v_vel_ms,
                    v_vel_fts : v_vel_ft,
                    timestamp : timestamp
                });
            });
        }catch(err)
        {
            console.log(err);
        }
    });

    res.send({status: 'recieved'});
});

module.exports = router;
