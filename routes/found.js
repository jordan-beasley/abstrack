var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next){
    res.render('found', { active_found: true, title: "Found" });
});

// route for post from form on found page
// should connect to twillio to send message
router.post('/', function(req, res, next){
    if(req.body.name.replace(/\s/g, '').length == 0 || req.body.message.replace(/\s/g, '').length == 0)
    {
        res.render('found', { active_found: true, title: "Found" });
    }else{
        res.render('found', { msgSuccess: { msg: "Thanks, we'll contact you as soon as possible."}, active_found: true, title: "Found"});
    }
});

module.exports = router;