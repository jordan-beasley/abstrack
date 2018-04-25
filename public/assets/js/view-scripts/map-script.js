// put in global scope for Google Maps api
function initMap() { }
var map;

(function(){
    $(window).on('load', function() 
    {
        var socket = io();

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
            strokeWeight: 2
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
            console.log('lat: ', lat);
            console.log('lon: ', lon);
        });

        //var path = predictedPath.getPath();
        //path.push(new google.maps.LatLng(coord.lat, coord.lon));
        //predictedPath.setPath(path);
        
    });

})();