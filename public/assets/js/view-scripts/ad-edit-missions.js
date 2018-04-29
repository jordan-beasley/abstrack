(function(){
    $(window).on('load', function()
    {
        var image_section = $('.image_section');
        var mission_id_list = $('#mission_id_list');
        var feature_mission = $('#mission_feature');
        var mission_title = $('#mission_title');
        var mission_subtitle = $('#mission_subtitle');
        var mission_description = $('#mission_description');
        var mission_date = $('#mission_date');
        var mission_body = $('#mission_body');
        var featured_image = $('#featured_image');
        var header = $('#mission_header');
        var mission_delete = $('.mission_delete');
        var mission_download = $('.mission_download');


        mission_id_list.on('change', function()
        {
            var id = mission_id_list.val();
            window.location.replace("/edit-missions?id=" + id);
        });
        
        var delete_image = function(event)
        {
            alertify.okBtn("Yes")
            .cancelBtn("No")
            .confirm("Are you sure you want to remove this image?", function () 
            {
                // clear all the fields
                var element = $(event.target);
                var parent = $(element.closest('ul'));
                parent.remove();
                alertify.delay(2000).success("Image removed"); // show for 2 seconds
            }, function() 
            {
                // do nothing
            });
        };
        
        $('.mission_add_image').on('click', function()
        {
            var images = $('.mission_image');
            var image_input = `<ul class="actions fit mission_image_wrapper">
            <li><input type="text" class="mission_image"/></li>
            <li><a class="button special icon fa-times mission_delete_image">Delete</a></li>
            </ul>`;
            image_section.append(image_input);

            $('.mission_delete_image').on('click', delete_image);
        });

        $('.mission_delete_image').on('click', delete_image);

        $('.mission_update').on('click', function()
        {
            var mission_images = $('.mission_image');
            var id = ($.trim(mission_id_list.val()) != '') ? mission_id_list.val() : '';
            var title = ($.trim(mission_title.val()) != '') ? mission_title.val() : '';
            var featured = Number.parseInt(feature_mission.val());
            featured = (featured != NaN) ? featured : 0;
            var subtitle = ($.trim(mission_subtitle.val()) != '') ? mission_subtitle.val() : '';
            var description = ($.trim(mission_description.val()) != '') ? mission_description.val() : '';
            var date = ($.trim(mission_date.val()) != '') ? mission_date.val() : '';
            var body = ($.trim(mission_body.val()) != '') ? mission_body.val() : '';
            var featuredImage = ($.trim(featured_image.val()) != '') ? featured_image.val() : '';

            if($.trim(title) != '' && $.trim(date) != '')
            {
                
                alertify.okBtn("Yes")
                .cancelBtn("No")
                .confirm("Are you sure you want to update this mission?", function () 
                {
                    var mission = 
                    {
                        id: id,
                        isFeature: featured,
                        date: moment(date).format("MMMM DD, YYYY"),
                        title: title,
                        subtitle: subtitle,
                        description: description,
                        body: body,
                        featuredImage: featuredImage,
                        images: []
                    };
    
                    for(var i = 0; i < mission_images.length; i++)
                    {
                        var image = $(mission_images[i]).val();
                        if($.trim(image) != '')
                        {
                            mission.images.push(image);
                        }
                    }

                    $.ajax({
                        type: "POST",
                        url: '/edit-missions',
                        data: mission,
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

            }else
            {
                alertify.error('Title and Date must be filled');
            }

        });

        $('.mission_new').on('click', function(){
            alertify.okBtn("Yes")
            .cancelBtn("No")
            .confirm("Are you sure you want to start a new mission?", function () 
            {
                // clear all the fields
                var mission_images = $('.mission_image_wrapper');
                
                for(var i = 0; i < mission_images.length; i++)
                {
                    var image = $(mission_images[i]);
                    $(image).remove();
                }

                var option_vals = mission_id_list[0].options;
                var mission_id = Number.parseInt($(option_vals[0]).attr('value'));

                for(var i = 0; i < option_vals.length; i++)
                {
                    var id = Number.parseInt($(option_vals[i]).attr('value'));

                    if(id > mission_id)
                    {
                        mission_id = id;
                    }
                }

                mission_id = mission_id + 1;
                var new_id = `<option value=${mission_id} selected>${mission_id}</option>`
                mission_id_list.prepend(new_id);
                mission_title.val('');
                feature_mission.val(0);
                mission_subtitle.val('');
                mission_description.val('');
                mission_date.val('');
                mission_body.val('');
                featured_image.val('');
                header.text("Editing Mission #" + mission_id);

                $('.mission_new').remove(); // only allow moving one mission ahead
                $('.mission_download').remove();
                mission_delete.remove();
                alertify.delay(2000).success("Now editing for mission " + mission_id); // show for 2 seconds
            }, function() 
            {
                // do nothing
            });
        });

        
        mission_delete.on('click', function()
        {
            alertify.okBtn("Yes")
            .cancelBtn("No")
            .confirm("Are you sure you want to delete this mission?", function () 
            {
                var id = mission_id_list.val();
                if(id != NaN)
                {
                    var mission = {
                        id: id
                    };

                    alertify.delay(2000).success("Deleting Mission"); // show for 2 seconds
                    $.ajax({
                        type: "POST",
                        url: '/edit-missions/delete-mission',
                        data: mission,
                        success: function(results, status)
                        {
                            if(results.success.status == 1)
                            {
                                alertify.success("Mission Deleted");
                                window.location.replace("/edit-missions");
                            }else
                            {
                                alertify.error("Could Not Delete Mission");
                            }
                        },
                        dataType: 'json'
                    });
                }
            }, function() 
            {
                // do nothing
            });
        });

        mission_download.on('click', function()
        {
            var id = mission_id_list.val();
            if(id != NaN)
            {
                var mission = {
                    id: id
                };

                $.ajax({
                    type: "GET",
                    url: '/edit-missions/mission-data',
                    data: mission,
                    success: function(results, status)
                    {

                        if(results.data.length != 0)
                        {
                            var flightdata = results.data;
                            var keys = Object.keys(flightdata[0]);
                            keys.sort();
                            var rows = [keys];
                            
                            for(var i = 0; i < flightdata.length; i++)
                            {
                                var values = [];
    
                                for(var j = 0; j < keys.length; j++)
                                {
                                    var key = keys[j];

                                    try
                                    {
                                        values.push(flightdata[i][key]);
                                    }catch(err)
                                    {
                                        values.push('');
                                    }
                                }
                                rows.push(values);
                            }
                            
                            var csvContent = "data:text/csv;charset=utf-8,";
                            rows.forEach(function(rowArray)
                            {
                                var row = rowArray.join(",");
                                csvContent += row + "\r\n";
                            });
                
                            var encodedUri = encodeURI(csvContent);
                            var link = document.createElement("a");
                            link.setAttribute("href", encodedUri);
                            link.setAttribute("download", "flightdata-mission-" + id + ".csv");
                            link.innerHTML= "Click Here to download";
                            document.body.appendChild(link); // Required for FF
                
                            link.click();
                            $(link).remove();

                        }else
                        {
                            alertify.error("No Mission Data Found");
                        }
                    },
                    dataType: 'json'
                });
            }
        });
    });
})();