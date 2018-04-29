var express = require('express');
var router = express.Router();
var MongoClient = require('mongodb').MongoClient;
require('dotenv/config');

var emptyMission = {

    id: -1,
    date:'',
    title: 'Mission Not Found',
    description: '',
    body: ''

}

router.get('/', function(req, res, next){

    if(req.query.id)
    {
        //simulation of database query to get mission information
        var missID = Number.parseInt(req.query.id);
        var mission = emptyMission;

        try
        {

        
            MongoClient.connect(process.env.MONGO_SERVER, function(err, db){
                if(err) throw err;
        
                var dbo = db.db(process.env.MONGO_DB);

                try{
                    dbo.collection(process.env.MISSIONS).findOne({ 'id' : missID })
                    .then(function(results)
                    {
                        if(results != null && results != undefined)
                        {
                            mission = results;    
                            res.render('mission/missiontemplate', { mission, active_mission: true, title: mission.title} );
                        }else
                        {
                            res.render('mission/missiontemplate', { mission, active_mission: true, title: mission.title} );
                        }

                        db.close();

                    });
                }catch(err)
                {
                    console.log(err);
                    res.render('mission/missiontemplate', { mission, active_mission: true, title: mission.title} );
                }
            });
        }catch(err)
        {
            console.log(err);
            res.render('mission/missiontemplate', { mission, active_mission: true, title: mission.title} );
        }

    }
    else
    {
        try
        {
            var featuredMission = null;
            var missions = [];

            MongoClient.connect(process.env.MONGO_SERVER, function(err, db){
                if(err) throw err;
        
                var dbo = db.db(process.env.MONGO_DB);
                
                try{
                    dbo.collection(process.env.MISSIONS).find({}, {sort: {id: -1}})
                    .toArray(function(err, results)
                    {
                        if(err) throw err;
                        results.forEach(function(miss)
                        {
                            if(miss.isFeature)
                            {
                                featuredMission = miss;
                            }
                            else{
                                missions.push(miss);
                            }
                        });

                        res.render('mission/missions', {title: 'Missions', active_mission: true, featuredMission, missions });
                        db.close();
                    });

                }catch(err)
                {
                    console.log(err);
                    res.render('mission/missions', {title: 'Missions', active_mission: true, featuredMission, missions });
                }
                
            });
        }catch(err)
        {
            console.log(err);
            res.render('mission/missions', {title: 'Missions', active_mission: true, featuredMission, missions });
        }
    }

});

module.exports = router;
