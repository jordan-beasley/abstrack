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
        var missID = Number.parseInt(req.query.id)
        var mission = emptyMission;

        MongoClient.connect(process.env.MONGO_SERVER, function(err, db){
            if(err) throw err;
    
            var dbo = db.db(process.env.MONGO_DB);

            try{
                dbo.collection(process.env.MISSIONS).findOne({ 'id' : missID })
                .then(function(result)
                {
                    if(result != null && result != undefined)
                    {
                        mission = result;    
                    }

                    res.render('mission/missiontemplate', { mission, active_mission: true, title: mission.title} );
                    db.close();

                });
            }catch(err)
            {
                console.log(err);
                res.render('mission/missiontemplate', { mission, active_mission: true, title: mission.title} );
            }
        });

    }
    else
    {
        MongoClient.connect(process.env.MONGO_SERVER, function(err, db){
            if(err) throw err;
    
            var dbo = db.db(process.env.MONGO_DB);
            var featuredMission = {};
            var missions = [];
            
            try{
                dbo.collection(process.env.MISSIONS).find({}).toArray(function(err, result)
                {
                    if(err) throw err;
                    result.forEach(function(miss){
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
    }

});

module.exports = router;
