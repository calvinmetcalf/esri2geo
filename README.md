esri2geo
========

This is a tool to turn esri json to geojson, which should work in the browser, in a worker, and in node.

Looking for the esri toolbox? It's over at [it's own repo](https://github.com/calvinmetcalf/esri2open) to hopefully merge with [@feomike's version](https://github.com/feomike/esri2open)  


## Sync Method

```javascript
var geoJSON = toGeoJSON(esriJSON);

// do something with geoJSON object
```


## Async Methods

```javascript
// callback for resulting data
function handleGeoJSON(err, data) { 
  if (err) {
    console.error(err);
    return;
  }
  
  // data => GeoJSON
  // do something with it..
}

toGeoJSON(esriJSON, handleGeoJSON);
// or
toGeoJSON('same/origin/url/to/esriJSON', handleGeoJSON);
```


## Using From Node

You can install from npm:

```shell
npm install esri2geo --save
```

The use from your node app like so:

```javascript
var esri2geo = require('esri2geo');

esri2geo(esriJSON, function (err, data) {
  // handle error, deal with data here
});
```

_Note: You can also use the other methods above._


_Disclaimer:_ not endorsed by, or have anything to do with ESRI.
