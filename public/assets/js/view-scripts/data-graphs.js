(function(){
    $(window).on('load', function() {

        var altPlot = Highcharts.chart('alt-plot', {
            chart: {
                type: 'area',
                zoomType: 'x',
                panning: true,
                events: {
                    load: function() {
                        var alt_data = this.series[0]; // grab the current data in the chart
                        
                        $.get('/live/live-altitude', function(data, status)
                        {
                            if(data != undefined || data != null)
                            {
                                data.forEach(point => {
                                    var time = point.time_utc.split(':'); // split time string to array [hr, min, sec]
                                    // convert values to utc timestamp
                                    var timestamp = moment.utc({hour: Number.parseInt(time[0]),
                                        minute: Number.parseInt(time[1]), second: Number.parseInt(time[2]), 
                                        milisecond: 0}).valueOf();

                                    var alt_m = Number.parseFloat(point.alt_m);
                                    var alt_ft = Number.parseFloat(point.alt_ft);

                                    alt_data.addPoint({ x: timestamp, y: alt_m, z: alt_ft}, false, false);
                                });
                                
                                altPlot.yAxis[0].isDirty = true;
                                altPlot.redraw();
                            }
                            

                        });
                    }
                }
            },
            title: {
                text: 'Altitude'
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
                //min: moment.utc(new Date()),
                //max: moment.utc(new Date()).add(3, 'h'),
                scrollbar: { enabled: true, showFull: false },
                endOnTick: true,
                tickLength: 0,
                tickInterval: 3600 * 1000

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

        var dewPlot = Highcharts.chart('dew-plot', {
            chart: {
                type: 'scatter',
                zoomType: 'xy',
                events: {
                    load: function() {

                        var chartData = this.series[0]; // grab the current data in the chart
                        // setInterval(function(){
                        //     var interval = this;
                        //     $.get('/prediction/liveupdate-graphs', function(data, status)
                        //     {
                        //         console.log("chart data:", data);
                        //         //data: [[828,-2.4],[814,-4.0], [807,-4.0], [804,-5.6], [759.9, -6.2],
                        //         //       [733.3, -6.5], [700,-7.0], [656.9, -8.9]]
                        //         if(data != undefined || data != null)
                        //         {
                        //             chartData.addPoint([data.dp, data.alt]); // add a new point to the chart
                        //         }else
                        //         {
                        //             clearInterval(interval);
                        //         }
                        //     });
                        // }, 3000);
                    }
                }
            },
            title: {
                text: 'Dew Point'
            },
            xAxis: {
                title:{
                    enabled: true,
                    text: 'Altitude (m)'
                },
                endOnTick: true,
                showLastLabel: true
            },
            yAxis: {
                title: {
                    text: 'Dew Point C'
                }
            },
            lang: {
                thousandsSep: ','
            },
            tooltip: {
                useHTML: true,
                formatter: function() {
                    var tooltip = `<small>${this.series.name}</small><table>
                    <tr><td>Altitude: </td> <td style="text-align: right"><b>${Highcharts.numberFormat(this.x, 0, '.', ',')}  m</b></td></tr>
                    <tr><td>Dew Point: </td> <td style="text-align: right"><b>${Highcharts.numberFormat(this.y, 0, '.', ',')} C</b></td></tr></table>`
                    return tooltip;
                }
            },
            series: [{
                name: 'Dew Point',
                color: 'rgb(0, 215, 46)',
                data:[]
            }]
        
        });
    });

})();