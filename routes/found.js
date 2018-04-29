var express = require('express');
var router = express.Router();
var moment = require('moment');
var MongoClient = require('mongodb').MongoClient;
require('dotenv/config');

router.get('/', function(req, res, next)
{
    if(req.query.p === 'records')
    {
        var cookie = req.cookies['abs-ad-key'];
    
        try
        {
            MongoClient.connect(process.env.MONGO_SERVER, function(err, db){
                if(err) throw err;
                
                var dbo = db.db(process.env.MONGO_DB);
                
                try
                {
                    dbo.collection(process.env.TESTCOL).findOne({key: { $eq: cookie }})
                    .then(function(results, err)
                    {
                        if(err) throw err;

                        if(results != null && results != undefined)
                        {
                            if(results.key == cookie)
                            {
                                try
                                {
                                    dbo.collection(process.env.FOUND_COLLECTION).find({}, {_id: 0})
                                    .toArray(function(err, results)
                                    {
                                        if(err) throw err;

                                        if(results != null && results != undefined)
                                        {
                                            var records = results;
                                            res.render('ad-foundrecords', {title: 'Records', f_records: results});
                                        }else
                                        {
                                            res.render('ad-foundrecords', {title: 'Records'});
                                        }

                                    });
                                }catch(err){
                                    console.log(err);
                                    res.render('ad-foundrecords', {title: 'Records'});
                                }
                                
                            }else
                            {
                                res.render('admin/login', {title: 'Login'});                        
                            }
                        }else
                        {
                            console.log(err);
                            res.render('admin/login', {title: 'Login'});
                        }

                    });
                }catch(err)
                {
                    console.log(err);
                    res.render('admin/login', {title: 'Login'});
                }
            });
        }catch(err)
        {
            console.log(err);
            res.render('admin/login', {title: 'Login'});
        }
    }else
    {
        res.render('found', { active_found: true, title: "Found" });
    }
});

// route for post from form on found page
// should connect to twillio to send message
router.post('/', function(req, res, next){
    
    if(req.body.name.trim() != '' || req.body.message.trim() != '')
    {
        var timestamp = moment(Date.now()).format('YYYY-MM-DD');

        try
        {
            MongoClient.connect(process.env.MONGO_SERVER, function(err, db){
                if(err) throw err;
                
                var dbo = db.db(process.env.MONGO_DB);

                try
                {
                    dbo.collection(process.env.FOUND_COLLECTION)
                    .insertOne({
                        name : req.body.name,
                        email : req.body.email,
                        phone : req.body.phone,
                        message : req.body.message,
                        timestamp: timestamp
                    });
                    res.render('found', { msgSuccess: { msg: "Thanks, we'll contact you as soon as possible."}, active_found: true, title: "Found"});

                }catch(err)
                {
                    console.log(err);
                    res.render('found', { active_found: true, title: "Found" });
                }
                
            });
        }catch(err){
            console.log(err);
            res.render('found', { active_found: true, title: "Found" });
        }
        
    }else
    {
        res.render('found', { active_found: true, title: "Found" });
    }
});

module.exports = router;