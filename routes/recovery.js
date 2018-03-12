var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next){
    res.render('recovery', {active_recov: true});
});

module.exports = router;