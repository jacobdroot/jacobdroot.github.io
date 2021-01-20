# Lab 1b: Turf.js and mobile optimization with Mapbox

## TGIS 504, Winter 2021, Dr. Emma Slager

### Introduction 

In this second part of lab 1, you will again practice making web maps that design for the unique affordances of mobile devices, this time incorporating the Turf JS library to do some basic spatial analysis in real time. 

I will first walk you through a tutorial that introduces one method of Turf JS--nearestPoint--to find the nearest hospital to any given library in the Tacoma Public Library System. Then on your own, you will use another Turf method to add some additional functionality to your map. 

The first part of this lab is based on the tutorial [Analyze data with Turf.js and Mapbox GL JS](https://docs.mapbox.com/help/tutorials/analysis-with-turf/), with additions and modifications by myself. 

### Set up your workspace

Begin by downloading the template files for the lab, including an index.html, javascript.js, and styles.css file. Save the files to your workspace, and open the files in Atom or the text editor of your choice. Eventually, you will upload the files to GitHub, so you may wish to create a repository for your files now, which also provides the benefit of serving as a backup for your work. As always, I recommend saving your work frequently and testing it regularly using atom-live-server or a similar Atom package. To save you some time, I have already added links to the necessary Mapbox libraries in the head of the index, included some basic CSS styling, and have created a `<div>` element in the body of the index to hold the map. 

### Step 1: Initialize the map and add data

Imagine you are part of a team that manages health and safety for the Tacoma Public Libraries. One important part of your preparedness mandate is to know which hospital is closes to each library in case there is an emergency at one of the library facilities. Steps 1-3 of this lab will walk you through making a map of libraries and hospitals; then, when a user clicks on a library, the map will show which hospital is nearest.

To initialize a Mapbox GL JS map, add the following script to your javascript.js file. Be sure to replace `accessToken}` with your own personal Mapbox access token:

```javascript
mapboxgl.accessToken = '{accessToken}'
var map = new mapboxgl.Map({
  container: 'map', // container id
  style: 'mapbox://styles/mapbox/light-v10', // stylesheet location
  center: [-122.4443, 47.2529], // starting position
  zoom: 10 // starting zoom
});
```

Now you should have a map centered on Tacoma, WA. Next, let's add data for the libraries and hospitals. 

In the past, I have had you add geojson data to your maps using external geojson files. This is because storing featureCollections as external files keeps our code tidy and makes it easier to read, and because external files can be cached by the browser to potentially speed up loading times. Here, however, we will put the source code of our geojson FeatureCollections directly into our JavaScript file, storing each featureCollection as a variable. This is because, we'll have to access these variables later in order to use Turf.js. It *is* possible to store a FeatureCollection in an external geojson file and to use Turf.js to analyze that data, but doing so requires JQuery, so to keep things simple while you're still learning, we'll store our geojson directly in the javascript. 

Under the existing code in your javascript file, add the following: 

```javascript
var hospitalPoints = {
  "type":"FeatureCollection",
  "features":[
    {"type":"Feature","geometry":{"type":"Point","coordinates":[-122.48083069805091,47.24158294247902]},"properties":{"NAME":"Allenmore Hospital","ADDRESS":"1901 S UNION AVE","CITY":"Tacoma","ZIP":98405}},
    {"type":"Feature","geometry":{"type":"Point","coordinates":[-122.29012358186617,47.17861596384059]},"properties":{"NAME":"Good Samaritan Hospital","ADDRESS":"401 15TH AVE SE","CITY":"Puyallup","ZIP":98372}},
    {"type":"Feature","geometry":{"type":"Point","coordinates":[-122.55190153531765,47.109023185217126]},"properties":{"NAME":"Madigan Hospital","ADDRESS":"9040 JACKSON AVE\r\n","CITY":"Tacoma","ZIP":98431}},
    {"type":"Feature","geometry":{"type":"Point","coordinates":[-122.50212346172164,47.15457916145514]},"properties":{"NAME":"St Clare Hospital","ADDRESS":"11315 BRIDGEPORT WAY SW","CITY":"Lakewood","ZIP":98499}},
    {"type":"Feature","geometry":{"type":"Point","coordinates":[-122.44793640184797,47.24530738056208]},"properties":{"NAME":"St Joseph Medical Center","ADDRESS":"1717 S J ST","CITY":"Tacoma","ZIP":98405}},
    {"type":"Feature","geometry":{"type":"Point","coordinates":[-122.45305284917963,47.25946004827884]},"properties":{"NAME":"Tacoma General Hospital","ADDRESS":"315 MARTIN LUTHER KING JR WAY","CITY":"Tacoma","ZIP":98405}},
    {"type":"Feature","geometry":{"type":"Point","coordinates":[-122.61346848763097,47.3644245711541]},"properties":{"NAME":"St Anthony Hospital","ADDRESS":"11567 CANTERWOOD BLVD NW","CITY":"Gig Harbor","ZIP":98332}},
    {"type":"Feature","geometry":{"type":"Point","coordinates":[-122.57559702458708,47.13526338360076]},"properties":{"NAME":"VA Puget Sound Health - American Lake","ADDRESS":"9600 VETERANS DR SW","CITY":"Tacoma","ZIP":98493}}
  ]
};

var libraryPoints = {
  "type":"FeatureCollection",
  "features":[
    {"type":"Feature","geometry":{"type":"Point","coordinates":[-122.44286601671358,47.18153501572299]},"properties":{"STREET":"765 S 84TH ST","CITY":"TACOMA","ZIPCODE_TX":98444,"NAME":"Fern Hill Branch Library"}},
    {"type":"Feature","geometry":{"type":"Point","coordinates":[-122.38636926841266,47.28798760158585]},"properties":{"STREET":"212 BROWNS POINT BLVD NE","CITY":"TACOMA","ZIPCODE_TX":98422,"NAME":"Kobetich Branch Library"}},
    {"type":"Feature","geometry":{"type":"Point","coordinates":[-122.44477915321865,47.2523969123164]},"properties":{"STREET":"1102 TACOMA AVE S","CITY":"TACOMA","ZIPCODE_TX":98402,"NAME":"Main Branch Library"}},
    {"type":"Feature","geometry":{"type":"Point","coordinates":[-122.43572732043167,47.20666248779983]},"properties":{"STREET":"215 S 56TH ST","CITY":"TACOMA","ZIPCODE_TX":98408,"NAME":"Moore Branch Library"}},
    {"type":"Feature","geometry":{"type":"Point","coordinates":[-122.42186773444043,47.228734823576495]},"properties":{"STREET":"3523 E G ST","CITY":"TACOMA","ZIPCODE_TX":98404,"NAME":"Mottet Branch Library"}},
    {"type":"Feature","geometry":{"type":"Point","coordinates":[-122.48204739978517,47.20640222475374]},"properties":{"STREET":"3411 S 56TH ST","CITY":"TACOMA","ZIPCODE_TX":98409,"NAME":"South Tacoma Branch Library"}},
    {"type":"Feature","geometry":{"type":"Point","coordinates":[-122.53048124147489,47.255795771423095]},"properties":{"STREET":"7001 6TH AVE","CITY":"TACOMA","ZIPCODE_TX":98406,"NAME":"Swasey Branch Library"}},
    {"type":"Feature","geometry":{"type":"Point","coordinates":[-122.48637925763215,47.27079139854106]},"properties":{"STREET":"3722 N 26TH ST","CITY":"TACOMA","ZIPCODE_TX":98406,"NAME":"Wheelock Branch Library"}}
  ]
};
```

These variables each hold a geojson FeatureCollection, one for [hospitals in Pierce County](https://gisdata-piercecowa.opendata.arcgis.com/datasets/public-health-care-facilities), and one for [Tacoma Public Libraries](https://gisdata-piercecowa.opendata.arcgis.com/datasets/libraries). (Those links will take you to the original data sources; I prepared the data in ArcMap by exporting only those features that met certain criteria, by deleting unnecessary columns from the attribute data, by projecting into WGS 1984, and then by converting to geojson). 

Next, we'll use a `map.on('load', function(){});` to add the data to the map as layers. At the bottom of your JavaScript file, add the following code: 

```javascript
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
  });
```

Refresh your page to test your code. You should see a medical cross icon for the hospitals and a book icon for the libraries. Both of these icons are conveniently built into the default Mapbox styles. Note that we use the 'icon-allow-overlap' option to specify that it is OK if the icons overlap one another. This ensures the icons will display at any zoom level, though they may overlap one another when the map is significantly zoomed out. 

### Step 2: Add clickable popups

Hover-over effects do not work particularly well with touch-screen mobile devices, so whenever we're designing for mobile, it is best to use 'click' event listeners (which are also effective with taps) rather than 'mousemove' listeners. Let's start with a popup for the Hospital layer. At the bottom of your JavaScript file, add the following code: 

```javascript
var popup = new mapboxgl.Popup();

map.on('click', 'hospitals', function(e) {

  var feature = e.features[0];

  popup.setLngLat(feature.geometry.coordinates)
    .setHTML(feature.properties.NAME)
    .addTo(map);
});
```

Now when we click on any of the hospital icons, we should get a popup showing the hospital's name. **On your own, add some code to the .setHTML line of the code to also display the hospital's address** (and add a space or other formatting between the name and address so that they don't run together.) Hint: view the GeoJson file stored in the 'hospitalPoints' variable to find the name of the property that holds the address values. 

For the interactivity on the library layer, we want to do a little more than just add the library's name to a popup. To achieve the goal of helping library staff identify the nearest hospital to teach library facility, we want the map to do three things when we click a library: 

1. Identify the nearest hospital 
2. Add a blue circle around the nearest hospital to help the user visually identify the hospital
3. Add both the library's name and the nearest hospital's name and address to a pop-up window. 

We'll achieve these tasks one by one in the next step. 

### Step 3: Using Turf to find the nearest point

[Turf](https://turfjs.org/) is a JavaScript library for adding spatial and statistical analysis to web maps. It contains many commonly used GIS tools--like buffer, union, and merge--as well as statistical analysis functions like sum, median, and average. One of Turf's functions is nearestPoint, which we'll use to find the hospital that is nearest each library. 

First things first, let's add a link to the Turf library in the head of our index file. 

```html
<script src='https://unpkg.com/@turf/turf/turf.min.js'></script>
```

Next, let's take a look at the Turf documentation to understand how nearestPoint works, what inputs we need to give the function, and what results we can get out of it. Visit https://turfjs.org/docs/#nearestPoint and read the documentation on this method. As the docs say, nearestPoint "takes a reference point and a FeatureCollection of Features with Point geometries and returns the point from the FeatureCollection closest to the reference." For our purposes, the reference point will be the library location that the user has clicked, and the target FeatureCollection will be the array of hospital locations stored in the hospitalPoints variable. One thing to note about this calculation: it uses birds-eye distance rather than network distance, and it's geodesic, meaning it follows the curve of the earth. 

Let's start by creating an event listener that will trigger a function when a library is clicked. At the end of your JavaScript file, add the following code: 

```javascript
map.on('click', 'libraries', function(f) {
    
}
```

Now let's complete our tasks. First, let's find the nearest library. Inside the { } in the code you just added, add the following: 

```javascript
  // Using Turf, find the nearest hospital to library clicked
  var refLibrary = f.features[0];
  var nearestHospital = turf.nearest(refLibrary, hospitalPoints);
```

Here we use the `turf.nearest` method, giving it the library that was just clicked as the first parameter and the array of hospital locations as the second parameter. 

Next, let's do something with the results of that calculation. We want to add a circle around the nearest hospital, but that circle needs to exist in a map layer, and that layer needs a source. To achieve this, we'll therefore add a blank source to the map on map load, then we'll update that source with the identity of the nearest hospital, and finally, we'll use the newly updated source to add a layer with a circle. 

**Inside the map.on('load', function() { } section of your code** (this should be right below the variables that hold our geojson files, ), after the two `map.addLayer` sections of code but before the onload function closes, add the following:

```javascript
  map.addSource('nearest-hospital', {
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: [
      ]
    }
  });
```

Next, inside the function that runs when a library is clicked, add the following: 

```javascript
    // Update the 'nearest-hospital' data source to include the nearest library
	map.getSource('nearest-hospital').setData({
      type: 'FeatureCollection',
      features: [
        nearestHospital
      ]
    });

    // Create a new circle layer from the 'nearest-hospital' data source
    map.addLayer({
      id: 'nearestHospitalLayer',
      type: 'circle',
      source: 'nearest-hospital',
      paint: {
        'circle-radius': 12,
        'circle-color': '#486DE0'
      }
    }, 'hospitals');
  }
```

Now, when you click a library, you should see a blue circle appear around the nearest hospital to that library. Well done! Finally, let's add a popup that gives the library name and information about the nearest hospital. Still inside the function that runs when a library is clicked, add the following: 

```javascript
popup.setLngLat(refLibrary.geometry.coordinates)
    .setHTML('<b>' + refLibrary.properties.NAME + '</b><br>The nearest hospital is ' + nearestHospital.properties.NAME + ', located at ' + nearestHospital.properties.ADDRESS)
    .addTo(map);
});
```

Congratulations! With ~120 lines of code or so, you've (hopefully) succeeded at making a tool that will allow library staff to find their nearest hospital in Tacoma. 

### Step 4: Use Turf to add a distance calculation to your popup

On your own, use the turf.distance method (documentation [here](https://turfjs.org/docs/#distance)) to calculate the distance from the library that was clicked to its nearest hospital. Add this distance calculation to the popup that appears when a library is clicked, also adding some formatting and framing text to help the user understand. 

Be sure to use **miles** for your units, and use the built-in JavaScript method [toFixed()](https://www.w3schools.com/jsref/jsref_tofixed.asp) to limit the display of the distance calculation to just two decimal points. Your finished product should yield a popup that looks something like this: 

![screenshot showing sample popup window](https://github.com/UWTMGIS/TGIS504_Wi21/blob/master/lab-1b/image1.png)

You should be able to achieve this with the addition of just 4 lines of code and modification to one existing line, though you *can* do it with as little as one additional line of code. Tips: 

* Think about where the additional line(s) of code need to be placed within your existing code.
* Since the from and to points require coordinates, think about how to get those coordinates using variables that are already named in your code. 

### Submission

Submit a link to your final work on Canvas. Along with the URL to the live version of your final map, submit a response to the following questions. Your answer should be a paragraph in length (~150-200 words): 

Browse the Turf JS documentation and the different methods it makes available. Choose one method that is familiar to you from prior GIS work you have done with desktop GIS software, such as ArcMap or QGIS.* 

1. What analysis method or task/tool did you choose? 
2. How does Turf's method of accomplishing this geospatial analysis task compare to the method you learned using desktop GIS? Do any of the inputs, parameters, or outputs of the operation differ from what you are familiar with? If so, how? 

*If you are having trouble deciding on a method to examine, I suggest Buffer. 
