var map = L.map('map').setView([51.505, -0.09], 13);
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoiamFrZXJvb3QxIiwiYSI6ImNraGNxOXp0cTBibmgyeG1kZ3I5ZmQyNXEifQ.ozY3QJOOnrA6prmZ-Ch11g'
}).addTo(map);

var drawnItems = L.featureGroup().addTo(map);
new L.Control.Draw({
    edit: {
        featureGroup: drawnItems
    }
}).addTo(map);

map.addEventListener("draw:created", function(e) {
    e.layer.addTo(drawnItems);
});
