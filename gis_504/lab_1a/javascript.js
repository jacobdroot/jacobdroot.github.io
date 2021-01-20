var light = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiamFrZXJvb3QxIiwiYSI6ImNraGNxOXp0cTBibmgyeG1kZ3I5ZmQyNXEifQ.ozY3QJOOnrA6prmZ-Ch11g', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id:'mapbox/light-v10',
    tileSize: 512,
    zoomOffset: -1,
});

var dark = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiamFrZXJvb3QxIiwiYSI6ImNraGNxOXp0cTBibmgyeG1kZ3I5ZmQyNXEifQ.ozY3QJOOnrA6prmZ-Ch11g', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id:'mapbox/dark-v10',
    tileSize: 512,
    zoomOffset: -1,
});

var map = L.map('map', {layers:[light]}).fitWorld();

window.alert("This website requires the use of your location. The website does not store this information, and it used only to locate you for the purpose of showing your location on this map.");

var mapdisplay = L.layerGroup([light, dark]);

var baseMaps = {
    "Dark": dark,
    "Light": light
};

L.control.layers(baseMaps).addTo(map);

function onLocationFound(e) {
    var radius = e.accuracy; //this defines a variable radius as the accuracy value returned by the locate method. The unit is meters.

    L.marker(e.latlng).addTo(map)  //this adds a marker at the lat and long returned by the locate function.
        .bindPopup("You are within " + Math.round(radius * 3.28084) + " feet of this point").openPopup(); //this binds a popup to the marker. The text of the popup is defined here as well. Note that we multiply the radius by 3.28084 to convert the radius from meters to feet and that we use Math.round to round the conversion to the nearest whole number.

        if (radius <= 100) {
          L.circle(e.latlng, radius, {color: 'green'}).addTo(map);
      }
      else{
          L.circle(e.latlng, radius, {color: 'red'}).addTo(map);
      }

  var times = SunCalc.getTimes(new Date(), e.latitude, e.longitude);
  var sunrise = times.sunrise.getHours();
  var sunset = times.sunset.getHours();


  var currentTime = new Date().getHours();
      if (sunrise < currentTime && currentTime < sunset){
        map.removeLayer(dark);
        map.addLayer(light);
      }
      else {
        map.removeLayer(light);
        map.addLayer(dark);
      }
}

map.on('locationfound', onLocationFound); //this is the event listener

function onLocationError(e) {
  alert(e.message);
}

map.on('locationerror', onLocationError);

map.locate({setView: true, maxZoom: 16});
