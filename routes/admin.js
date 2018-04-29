var express = require('express');
var router = express.Router();
var crypto = require('crypto');
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
                            res.render('admin/main', {title: 'Admin'});
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

router.post('/', function(req, res, next)
{
    var un = req.body.username;
    var ps = req.body.pass;
    
    if(un.trim() != '' && ps.trim() != '')
    {
        try
        {
            MongoClient.connect(process.env.MONGO_SERVER, function(err, db){
                if(err) throw err;
        
                var dbo = db.db(process.env.MONGO_DB);
        
                try
                {
                    dbo.collection(process.env.TESTCOL).findOne({username: {$eq: un}, pass: {$eq: ps}})
                    .then(function(results, err)
                    {
                        if(err) throw err;
                        if(results != null && results != undefined)
                        {
                            var cookie = req.cookies['abs-ad-key'];
                            
                            if(cookie != null && cookie != undefined
                            && cookie != '')
                            {
                                if(cookie != results.key)
                                {
                                    var buffer = crypto.randomBytes(25).toString('hex');
                                    var hash = crypto.createHmac('sha256', buffer).digest('hex');
                                    dbo.collection(process.env.TESTCOL).updateOne({username: {$eq: un}, pass: {$eq: ps}}, {$set: {key: hash}})
                                    .then(function(results)
                                    {
                                        // cookie expies in 24 hrs
                                        res.cookie('abs-ad-key', hash, { maxAge: 24 * 60 * 60 * 1000, httpOnly: true });
                                        res.render('admin/main', {title: 'Admin'});
                                    });

                                }else
                                {
                                    res.render('admin/main', {title: 'Admin'});
                                }

                                
                            }else
                            {
                                var buffer = crypto.randomBytes(25).toString('hex');
                                var hash = crypto.createHmac('sha256', buffer).digest('hex');
                                
                                dbo.collection(process.env.TESTCOL).updateOne({username: {$eq: un}, pass: {$eq: ps}}, {$set: {key: hash}})
                                .then(function(results)
                                {
                                    // cookie expies in 24 hrs
                                    res.cookie('abs-ad-key', hash, { maxAge: 24 * 60 * 60 * 1000, httpOnly: true });
                                    res.render('admin/main', {title: 'Admin'});
                                });
                            }
                            
                        }else
                        {
                            res.render('admin/login', {title: 'Login', errMsg: "Incorrect username or password" });
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

    }

});
module.exports = router;