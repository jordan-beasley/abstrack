(function(){
    $(window).on('load', function() {

        var socket = io();

        var altPlot = Highcharts.chart('alt-plot', {
            chart: {
                type: 'areaspline',
                zoomType: 'x',
                panning: true,
                events: {
                    load: function() {
                        var alt_data = this.series[0]; // grab the current data in the chart
                        socket.on('flight-data-alt', function(point)
                        {
                            var time = point.time_utc.split(':'); // split time string to array [hr, min, sec]
                            // convert values to utc timestamp
                            var timestamp = moment.utc({hour: Number.parseInt(time[0]),
                                minute: Number.parseInt(time[1]), second: Number.parseInt(time[2]), 
                                milisecond: 0}).valueOf();

                            var alt_m = Number.parseFloat(point.alt_m);
                            var alt_ft = Number.parseFloat(point.alt_ft);

                            alt_data.addPoint({ x: timestamp, y: alt_m, z: alt_ft}, false, false);
                            altPlot.setSubtitle({text: 'Altitude(m): ' + alt_m});
                            altPlot.yAxis[0].isDirty = true;
                            altPlot.redraw();
                        });
                    }
                }
            },
            title: {
                text: 'Altitude'
            },
            subtitle: {
                floating: true,
                align: 'left',
                x: 80,
                y: 60,
                style: {
                    fontWeight: 'bold',
                    fontSize: '1rem'
                }
            },
            xAxis: {
                title:{
                    enabled: true,
                    text: 'Time-UTC'
                },
                labels: {
                    formatter: function() {
                        return `${moment.utc(this.value).format("HH:mm:ss")}`
                    }
                },
                type: 'datetime',
                scrollbar: { enabled: true, showFull: false },
                endOnTick: true,
                tickLength: 0

            },
            yAxis: {
                title: {
                    text: 'Altitude'
                }
            },
            lang: {
                thousandsSep: ','
            },
            tooltip: {
                useHTML: true,
                formatter: function() 
                {
                    var tooltip = `<table>
                    <tr><td style="padding: 0.15rem;">Altitude: </td> <td style="text-align: right; padding: 0.15rem;"><b>${this.point.y} m</b></td></tr>
                    <tr><td style="padding: 0.15rem;">Altitude: </td> <td style="text-align: right; padding: 0.15rem;"><b>${this.point.z} ft</b></td></tr>
                    <tr><td style="padding: 0.15rem;">Timestamp: </td> <td style="text-align: right; padding: 0.15rem;"><b>${moment.utc(this.point.x).format('HH:mm:ss')}  UTC</b></td></tr></table>`
                    return tooltip;
                }
            },
            series: [{
                name: 'Altitude (m)',
                color: 'rgb(39, 132, 251)',
                data: []
            }]
        
        });

        var velPlot = Highcharts.chart('vel-plot', {
            chart: {
                type: 'spline',
                zoomType: 'x',
                panning: true,
                events: {
                    load: function() {
                        var vel_data = this.series[0]; // grab the current data in the chart
                        socket.on('flight-data-vel', function(point)
                        {
                            var time = point.time_utc.split(':'); // split time string to array [hr, min, sec]
                            // convert values to utc timestamp
                            var timestamp = moment.utc({hour: Number.parseInt(time[0]),
                                minute: Number.parseInt(time[1]), second: Number.parseInt(time[2]), 
                                milisecond: 0}).valueOf();

                            var v_vel_ms = Number.parseFloat(point.v_vel_ms);
                            var v_vel_ft = Number.parseFloat(point.v_vel_ft);

                            vel_data.addPoint({ x: timestamp, y: v_vel_ms, z: v_vel_ft}, false, false);
                            velPlot.setSubtitle({text: 'Velocity(m/s): ' + v_vel_ms});
                            velPlot.yAxis[0].isDirty = true;
                            velPlot.redraw();
                        });
                    }
                }
            },
            title: {
                text: 'Velocity'
            },
            subtitle: {
                floating: true,
                align: 'left',
                x: 80,
                y: 60,
                style: {
                    fontWeight: 'bold',
                    fontSize: '1rem'
                }
            },
            xAxis: {
                title:{
                    enabled: true,
                    text: 'Time-UTC'
                },
                labels: {
                    formatter: function() {
                        return `${moment.utc(this.value).format("HH:mm:ss")}`
                    }
                },
                type: 'datetime',
                scrollbar: { enabled: true, showFull: false },
                endOnTick: true,
                tickLength: 0

            },
            yAxis: {
                title: {
                    text: 'Velocity(m/s)'
                }
            },
            lang: {
                thousandsSep: ','
            },
            tooltip: {
                useHTML: true,
                formatter: function() {

                    var tooltip = `<table>
                    <tr><td style="padding: 0.15rem;">Altitude: </td> <td style="text-align: right; padding: 0.15rem;"><b>${this.point.y} m/s</b></td></tr>
                    <tr><td style="padding: 0.15rem;">Altitude: </td> <td style="text-align: right; padding: 0.15rem;"><b>${this.point.z} ft/s</b></td></tr>
                    <tr><td style="padding: 0.15rem;">Timestamp: </td> <td style="text-align: right; padding: 0.15rem;"><b>${moment.utc(this.point.x).format('HH:mm:ss')}  UTC</b></td></tr></table>`
                    return tooltip;
                }
            },
            series: [{
                name: 'Velocity',
                color: 'rgb(0, 215, 46)',
                data:[]
            }]
        
        });
    });
})();