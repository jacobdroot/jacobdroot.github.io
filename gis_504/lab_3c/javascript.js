var map = L.map('map').setView([38.879738328426306, -77.10696313825618], 13);
L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/streets-v11',
    tileSize: 512,
    zoomOffset: -1,
    accessToken: 'pk.eyJ1IjoiamFrZXJvb3QxIiwiYSI6ImNraGNxOXp0cTBibmgyeG1kZ3I5ZmQyNXEifQ.ozY3QJOOnrA6prmZ-Ch11g'
}).addTo(map);

var drawnItems = L.featureGroup().addTo(map);

var cartoData = L.layerGroup().addTo(map);
var url = "https://jakeroot.carto.com/api/v2/sql";
var urlGeoJSON = url + "?format=GeoJSON&q=";
var sqlQuery = "SELECT the_geom, signalfaces, backplate, attachment FROM jacobroot_app";
function addPopup(feature, layer) {
    layer.bindPopup(
        "<b>Signal Faces: </b>" + feature.properties.signalfaces + "<br>" +
        "<b>Backplate? </b>" + feature.properties.backplate + "<br>" +
        "<b>Attachment Style: </b>" + feature.properties.attachment
    );
}

fetch(urlGeoJSON + sqlQuery)
    .then(function(response) {
    return response.json();
    })
    .then(function(data) {
        L.geoJSON(data, {onEachFeature: addPopup}).addTo(cartoData);
    });

new L.Control.Draw({ // apply 'false' to everything except marker
    draw : {
        polygon : false,
        polyline : false,
        rectangle : false,
        circle : false,
        circlemarker : false,
        marker: true
    },
    edit : {
        featureGroup: drawnItems
    }
}).addTo(map);

function createFormPopup() {
    var popupContent =
        '<form>' +
        'Number of Signal Faces: 3, 4 or 5...<br><input type="text" id="input_signalfaces"><br>' +
        'Backplate? Yes or No...<br><input type="text" id="input_backplate"><br>' +
        'Attached to pole or mast arm?<br><input type="text" id="input_attachment"><br>' +
        '<input type="button" value="Submit" id="submit">' +
        '</form>'
    drawnItems.bindPopup(popupContent).openPopup();
}

map.addEventListener("draw:created", function(e) {
    e.layer.addTo(drawnItems);
    drawnItems.eachLayer(function(layer) {
        var geojson = JSON.stringify(layer.toGeoJSON().geometry);
        console.log(geojson);
    e.layer.addTo(drawnItems);
    createFormPopup();
    });
});

function setData(e) {

    if(e.target && e.target.id == "submit") {

        // Get user name and description
        var enteredSignalFaces = document.getElementById("input_signalfaces").value;
        var enteredBackplate = document.getElementById("input_backplate").value;
        var enteredAttachment = document.getElementById("input_attachment").value;

        // For each drawn layer
          drawnItems.eachLayer(function(layer) {

      			// Create SQL expression to insert layer
                  var drawing = JSON.stringify(layer.toGeoJSON().geometry);
                  var sql =
                      "INSERT INTO jacobroot_app (the_geom, signalfaces, backplate, attachment) " +
                      "VALUES (ST_SetSRID(ST_GeomFromGeoJSON('" +
                      drawing + "'), 4326), '" +
                      enteredSignalFaces + "', '" +
                      enteredBackplate + "', '" +
                      enteredAttachment + "')";
                  console.log(sql);

                  // Send the data
                  fetch(url, {
                      method: "POST",
                      headers: {
                          "Content-Type": "application/x-www-form-urlencoded"
                      },
                      body: "q=" + encodeURI(sql)
                  })
                  .then(function(response) {
                      return response.json();
                  })
                  .then(function(data) {
                      console.log("Data saved:", data);
                  })
                  .catch(function(error) {
                      console.log("Problem saving the data:", error);
                  });

              // Transfer submitted drawing to the CARTO layer
              //so it persists on the map without you having to refresh the page
              var newData = layer.toGeoJSON();
              newData.properties.signalfaces = enteredSignalFaces;
              newData.properties.backplate = enteredBackplate;
              newData.properties.attachment = enteredAttachment;
              L.geoJSON(newData, {onEachFeature: addPopup}).addTo(cartoData);

          });

        // Clear drawn items layer
        drawnItems.closePopup();
        drawnItems.clearLayers();

    }
}

document.addEventListener("click", setData);

map.addEventListener("draw:editstart", function(e) {
    drawnItems.closePopup();
});
map.addEventListener("draw:deletestart", function(e) {
    drawnItems.closePopup();
});
map.addEventListener("draw:editstop", function(e) {
    drawnItems.openPopup();
});
map.addEventListener("draw:deletestop", function(e) {
    if(drawnItems.getLayers().length > 0) {
        drawnItems.openPopup();
    }
});
