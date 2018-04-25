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
                            try
                            {
                                dbo.collection(process.env.MISSIONS).find({}, {sort: {id: -1}})
                                .toArray(function(err, results)
                                {
                                    if (err) throw err;
                                    
                                    if(results != null && results != undefined)
                                    {
                                        var mission = results[0];
                                        var ids = [];
                                        results.forEach(function(miss)
                                        {
                                            if(req.query.id && req.query.id == miss.id)
                                            {
                                                mission = miss;
                                            }

                                            ids.push(miss.id)
                                        });
                                        var date = moment(mission.date, "MMMM DD, YYYY");
                                        mission.date = date.format('YYYY-MM-DD');
                                        res.render('edit-missions', {title: 'Edit', mission: mission, ids: ids, active_admin_edit: true});
                                    }else
                                    {
                                        res.render('admin/main', {title: 'Admin'});
                                    }

                                    db.close();

                                });
                            }
                            catch(err)
                            {
                                console.log(err);
                            }
                        }else
                        {
                            res.render('admin/login', {title: 'Login'});                        
                        }
                    }else
                    {
                        res.render('admin/login', {title: 'Login'});
                    }

                    db.close();

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

router.post('/', function(req, res)
{
    var cookie = req.cookies['abs-ad-key'];
    console.log("delete: ", req.body);
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
                                var json_images_array = [];

                                try
                                {
                                    var json_images = JSON.stringify(req.body['images[]']);
                                    json_images_array = JSON.parse(json_images);
                                }catch(err)
                                { 
                                    /* do nothing */ 
                                }

                                var featured = (Number.parseInt(req.body.isFeature) == 1) ? true : false;
                                var missionId = Number.parseInt(req.body.id);
                                var date = moment(Date.now());
                                var timestamp = date.format('YYYY-MM-DD');

                                if(featured)
                                {
                                    dbo.collection(process.env.MISSIONS)
                                    .updateOne({isFeature: featured},
                                        {$set: {isFeature: false, timestamp: timestamp}},
                                    function(err, results)
                                    {
                                        if (err) throw err;
                                    });
                                }

                                dbo.collection(process.env.MISSIONS)
                                .findOneAndUpdate({id: missionId}, 
                                    {$set: {date: req.body.date, isFeature: featured, date: req.body.date,
                                            title: req.body.title, subtitle: req.body.subtitle,
                                            description: req.body.description, body: req.body.body,
                                            featuredImage: req.body.featuredImage, images: json_images_array,
                                            timestamp: timestamp}},
                                    {upsert: true},
                                function(err, results)
                                {
                                    if (err) throw err;

                                    if(results != null && results != undefined)
                                    {
                                        res.send({success: {status: results.ok }});
                                    }else
                                    {
                                        res.send({success: {status: 0 }});
                                    }

                                    db.close();

                                });
                            }
                            catch(err)
                            {
                                console.log(err);
                            }
                        }else
                        {
                            res.send({success: {status: 0 }});
                        }
                    }else
                    {
                        res.send({success: {status: 0 }});
                    }

                    db.close();

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


router.post('/delete-mission', function(req, res)
{
    var cookie = req.cookies['abs-ad-key'];
    console.log("delete: ", req.body);

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
                                var missionId = Number.parseInt(req.body.id);

                                dbo.collection(process.env.MISSIONS)
                                .deleteOne({id: missionId},
                                function(err, results)
                                {
                                    if (err) throw err;
                                    
                                    res.send({success: {status: 1}});

                                    db.close();

                                });
                            }
                            catch(err)
                            {
                                console.log(err);
                                res.send({success: {status: 0 }});
                            }
                        }else
                        {
                            res.send({success: {status: 0 }});
                        }
                    }else
                    {
                        res.send({success: {status: 0 }});
                    }

                    db.close();

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

router.get('/mission-data', function(req, res)
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
                                var missionId = Number.parseInt(req.query.id);

                                dbo.collection(process.env.FLIGHT_DATA_COLLECTION)
                                .find({mission_id: missionId}, {_id: 0, timestamp: 0, mission_id: 0})
                                .toArray(function(err, results)
                                {
                                    if (err) throw err;
                                    
                                    if(results != null && results != undefined)
                                    {
                                        res.send({data: results});
                                    }else
                                    {
                                        res.send({});
                                    }

                                    db.close();

                                });
                            }
                            catch(err)
                            {
                                console.log(err);
                                res.send({});
                            }
                        }else
                        {
                            res.send({});
                        }
                    }else
                    {
                        res.send({});
                        db.close();
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
        res.send({});
    }
});


module.exports = router;