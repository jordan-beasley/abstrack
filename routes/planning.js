var express = require('express');
var router = express.Router();
var moment = require('moment');
var MongoClient = require('mongodb').MongoClient;
require('dotenv/config');


router.get('/', function(req, res, next)
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
                            dbo.collection(process.env.PLANNING_COLLECTION).findOne({}, {_id: 0})
                            .then(function(results)
                            {
                                db.close();
                                if(results != null && results != undefined)
                                {
                                    res.render('planning', {title: 'Planning', active_admin_planning: true, plan: results });
                                }else
                                {
                                    res.render('planning', {title: 'Planning', active_admin_planning: true });
                                }

                            });
                        }else
                        {
                            res.render('admin/login', {title: 'Login'});                        
                        }
                    }else
                    {
                        db.close();
                        res.render('admin/login', {title: 'Login'});
                    }

                    //db.close();
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
});

router.post('/', function(req, res, next)
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
                                var active_status = (Number.parseInt(req.body.active_status) == 1) ? true : false;
                                var date = moment(Date.now());
                                var timestamp = date.format('YYYY-MM-DD');
                                var missionId = Number.parseInt(req.body.mission_id);
                                dbo.collection(process.env.PLANNING_COLLECTION)
                                .update({}, {$set: {launch_date: req.body.launch_date, launch_site: req.body.launch_site, 
                                            mission_id: missionId, active: active_status, timestamp: timestamp}})
                                .then(function(results)
                                {
                                    db.close();
                                    if(results != null && results != undefined)
                                    {
                                        res.send({success: {status: results.result.ok }});
                                    }else
                                    {
                                        res.send({success: {status: 0 }});
                                    }

                                });
                            }catch(err)
                            {
                                console.log(err);
                            }
                        }else
                        {
                            res.send({success: {status: 0 }});                        
                        }
                    }else
                    {
                        db.close();
                        res.send({success: {status: 0 }});
                    }

                });
            }catch(err)
            {
                console.log(err);
                res.send({success: {status: 0 }});
            }
        });
    }catch(err)
    {
        console.log(err);
        res.send({success: {status: 0 }});
    }
});

module.exports = router;