var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next){
    res.render('prediction', {title: 'Prediction', active_pred: true});
});
module.exports = router;