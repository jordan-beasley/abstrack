
var hbHelpers = {

    // custom helper
    eq: function(options){
        var is_equal = (options.hash.val_one == options.hash.val_two);
        return is_equal;
    }
};

module.exports = hbHelpers;