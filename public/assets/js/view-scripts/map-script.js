// put in global scope for Google Maps api
function initMap() { }
var map;

(function(){
    $(window).on('load', function() 
    {
        var socket = io();
        var recent_coord = $('#recent-coord');
        var map_update = $('.map_update');

        // overwriting the initMap function to load map
        initMap = (function() {
            map = new google.maps.Map(document.getElementById('map'), {
                center: {lat: 35.842335, lng: -90.6788892},
                zoom: 8
            });
        })();
        
        
        var predictedPath = new google.maps.Polyline({
            path: [],
            geodesic: true,
            strokeColor: '#FF0000',
            strokeOpacity: 1.0,
            strokeWeight: 2,
            zIndex: 2
        });
        predictedPath.setMap(map);

        socket.on('flight-data-gps', function(coord)
        {
            var path = predictedPath.getPath();
            var lat = Number.parseFloat(coord.lat);
            var lon = Number.parseFloat(coord.lon);

            var cityCircle = new google.maps.Circle({
                strokeColor: '#FF0000',
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: '#FF0000',
                fillOpacity: 0.35,
                map: map,
                center: new google.maps.LatLng(lat, lon),
                radius: 5
            });
            
            path.push(new google.maps.LatLng(lat, lon));
            predictedPath.setPath(path);
            recent_coord.text('Lat: ' + lat + ", Long: " + lon);
        });

        map_update.on('click', function(){
            var historyPath = new google.maps.Polyline({
                path: [],
                geodesic: true,
                strokeColor: '#00A307',
                strokeOpacity: 1.0,
                strokeWeight: 2
            });
            historyPath.setMap(map);

            $.get('live/coords', function(coords)
            {

                if(coords != undefined && coords.length > 0)
                {
                    var path = historyPath.getPath();

                    coords.forEach(coord => {
                        var lat = Number.parseFloat(coord.lat);
                        var lon = Number.parseFloat(coord.lon);
                        path.push(new google.maps.LatLng(lat, lon));
                    });

                    historyPath.setPath(path);
                    var index = coords.length - 1;
                    recent_coord.text('Lat: ' + coords[index].lat + ", Long: " + coords[index].lon);
                }
            });
        });
    });
})();