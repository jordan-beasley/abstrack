(function(){
    $(window).on('load', function()
    {
        var status = $('#active_status');
        var date = $('#planning_date');
        var location = $('#location');
        var header = $('#planning_header');
        
        $('.planning_submit').on('click', function(){
            var active_status = Number.parseInt(status.val());
            var launch_date = date.val();
            var launch_site = location.val();
            var mission_id = Number.parseInt(header.attr('data-id'));

            if(mission_id != NaN && (launch_date != undefined && $.trim(launch_date) != '') 
               && (launch_site != undefined && $.trim(launch_site) != '') && active_status != NaN)
            {
                alertify.okBtn("Yes")
                .cancelBtn("No")
                .confirm("Are you sure you want to update this mission?", function () 
                {
                    var plan = {
                        mission_id: mission_id,
                        active_status: active_status,
                        launch_date: launch_date,
                        launch_site: launch_site
                    };
                    $.ajax({
                        type: "POST",
                        url: '/planning',
                        data: plan,
                        success: function(results, status)
                        {
                            if(results.success.status == 1)
                            {
                                alertify.success("Mission Status Updated");
                            }else
                            {
                                alertify.error("Could Not Updated Mission Status");
                            }
                        },
                        dataType: 'json'
                    });
                }, function() 
                {
                    // do nothing
                });
            }else{
                alertify.delay(2000).error("Please fill all fields"); // show for 2 seconds
            }

        });

        $('.planning_new').on('click', function(){
            alertify.okBtn("Yes")
            .cancelBtn("No")
            .confirm("Are you sure you want to start a new mission?", function () 
            {
                // clear all the fields
                status.val(0);
                date.val('');
                location.val('');
                var mission_id = Number.parseInt(header.attr('data-id')) + 1;
                header.attr('data-id', mission_id);
                header.text("Planning #" + mission_id);
                $('.planning_new').remove(); // only allow moving one mission ahead
                alertify.delay(2000).success("Now planning for mission " + mission_id); // show for 2 seconds
            }, function() 
            {
                // do nothing
            });
        });
    });
})();