mapboxgl.accessToken = 'pk.eyJ1IjoiamFrZXJvb3QxIiwiYSI6ImNraGNxOXp0cTBibmgyeG1kZ3I5ZmQyNXEifQ.ozY3QJOOnrA6prmZ-Ch11g'
var map = new mapboxgl.Map({
   container: 'map',
   style: 'mapbox://styles/mapbox/light-v10',
   center: [-122.4443, 47.2529],
   zoom: 10
 });

 var hospitalPoints = {
   "type":"FeatureCollection",
   "features":[
     {"type":"Feature","geometry":{"type":"Point","coordinates":[-122.48083069805091,47.24158294247902]},"properties":{"Name":"Allenmore Hospital","Address":"1901 S Union Ave","CITY":"Tacoma","ZIP":98405}},
     {"type":"Feature","geometry":{"type":"Point","coordinates":[-122.29012358186617,47.17861596384059]},"properties":{"Name":"Good Samaritan Hospital","Address":"401 15th Ave SE","CITY":"Puyallup","ZIP":98372}},
     {"type":"Feature","geometry":{"type":"Point","coordinates":[-122.55190153531765,47.109023185217126]},"properties":{"Name":"Madigan Hospital","Address":"9040 Jackson Ave\r\n","CITY":"Tacoma","ZIP":98431}},
     {"type":"Feature","geometry":{"type":"Point","coordinates":[-122.50212346172164,47.15457916145514]},"properties":{"Name":"St Clare Hospital","Address":"11315 Bridgeport Way SW","CITY":"Lakewood","ZIP":98499}},
     {"type":"Feature","geometry":{"type":"Point","coordinates":[-122.44793640184797,47.24530738056208]},"properties":{"Name":"St Joseph Medical Center","Address":"1717 S 'J' St","CITY":"Tacoma","ZIP":98405}},
     {"type":"Feature","geometry":{"type":"Point","coordinates":[-122.45305284917963,47.25946004827884]},"properties":{"Name":"Tacoma General Hospital","Address":"315 Martin Luther King Jr Way","CITY":"Tacoma","ZIP":98405}},
     {"type":"Feature","geometry":{"type":"Point","coordinates":[-122.61346848763097,47.3644245711541]},"properties":{"Name":"St Anthony Hospital","Address":"11567 Canterwood Blvd NW","CITY":"Gig Harbor","ZIP":98332}},
     {"type":"Feature","geometry":{"type":"Point","coordinates":[-122.57559702458708,47.13526338360076]},"properties":{"Name":"VA Puget Sound Health - American Lake","Address":"9600 Veterans Dr SW","CITY":"Tacoma","ZIP":98493}}
   ]
 };

 var libraryPoints = {
   "type":"FeatureCollection",
   "features":[
     {"type":"Feature","geometry":{"type":"Point","coordinates":[-122.44286601671358,47.18153501572299]},"properties":{"STREET":"765 S 84th St","CITY":"TACOMA","ZIPCODE_TX":98444,"Name":"Fern Hill Branch Library"}},
     {"type":"Feature","geometry":{"type":"Point","coordinates":[-122.38636926841266,47.28798760158585]},"properties":{"STREET":"212 Browns Point Blvd NE","CITY":"TACOMA","ZIPCODE_TX":98422,"Name":"Kobetich Branch Library"}},
     {"type":"Feature","geometry":{"type":"Point","coordinates":[-122.44477915321865,47.2523969123164]},"properties":{"STREET":"1102 Tacoma Ave S","CITY":"TACOMA","ZIPCODE_TX":98402,"Name":"Main Branch Library"}},
     {"type":"Feature","geometry":{"type":"Point","coordinates":[-122.43572732043167,47.20666248779983]},"properties":{"STREET":"215 S 56th St","CITY":"TACOMA","ZIPCODE_TX":98408,"Name":"Moore Branch Library"}},
     {"type":"Feature","geometry":{"type":"Point","coordinates":[-122.42186773444043,47.228734823576495]},"properties":{"STREET":"3523 E 'G' St","CITY":"TACOMA","ZIPCODE_TX":98404,"Name":"Mottet Branch Library"}},
     {"type":"Feature","geometry":{"type":"Point","coordinates":[-122.48204739978517,47.20640222475374]},"properties":{"STREET":"3411 S 56th St","CITY":"TACOMA","ZIPCODE_TX":98409,"Name":"South Tacoma Branch Library"}},
     {"type":"Feature","geometry":{"type":"Point","coordinates":[-122.53048124147489,47.255795771423095]},"properties":{"STREET":"7001 6th Ave","CITY":"TACOMA","ZIPCODE_TX":98406,"Name":"Swasey Branch Library"}},
     {"type":"Feature","geometry":{"type":"Point","coordinates":[-122.48637925763215,47.27079139854106]},"properties":{"STREET":"3722 N 26th St","CITY":"TACOMA","ZIPCODE_TX":98406,"Name":"Wheelock Branch Library"}}
   ]
 };

map.on('load', function() {
 map.addLayer({
   id: 'hospitals',
   type: 'symbol',
   source: {
     type: 'geojson',
     data: hospitalPoints
   },
   layout: {
     'icon-image': 'hospital-15',
     'icon-allow-overlap': true
   },
   paint: { }
 });
 map.addLayer({
   id: 'libraries',
   type: 'symbol',
   source: {
     type: 'geojson',
     data: libraryPoints
   },
   layout: {
     'icon-image': 'library-15',
     'icon-allow-overlap': true
   },
   paint: { }
 })
 map.addSource('nearest-hospital', {
   type: 'geojson',
   data: {
     type: 'FeatureCollection',
     features: [
     ]
   }
 });
});


var popup = new mapboxgl.Popup();

map.on('click', 'hospitals', function(e) {

 var feature = e.features[0];

 popup.setLngLat(feature.geometry.coordinates)
   .setHTML("<b>Name</b>: " + feature.properties.Name + "<br>" + "<b>Address</b>: " + feature.properties.Address )
   .addTo(map);
});

map.on('click', 'libraries', function(f) {
 var refLibrary = f.features[0];
 var nearestHospital = turf.nearest(refLibrary, hospitalPoints);
 var distance = turf.distance(refLibrary, nearestHospital, {units: 'miles'});
map.getSource('nearest-hospital').setData({
 type: 'FeatureCollection',
 features: [
   nearestHospital
 ]
});

map.addLayer({
 id: 'nearestHospitalLayer',
 type: 'circle',
 source: 'nearest-hospital',
 paint: {
   'circle-radius': 12,
   'circle-color': '#486DE0'
 }
}, 'hospitals');

popup.setLngLat(refLibrary.geometry.coordinates)
 .setHTML('<b>' + refLibrary.properties.Name + '</b><br>The nearest hospital is ' + nearestHospital.properties.Name + ', located at ' + nearestHospital.properties.Address + "." + "<br>" + "It is " + '<b>' + distance.toFixed(2) + " miles away.")
 .addTo(map);
});
