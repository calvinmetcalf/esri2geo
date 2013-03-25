esri2geo
========

Converts ESRI to geojson and other open formats, two seperate tools:

* A toolbox you can use from inside arcpay with three tools
    1. A tool to allow export as geojson, regular json (just an array of the properties objects optionally with geometery as a property) or csv (same as json but as csv). 
    2. A tool to do that in bulk.
    3. A tool to merge multiple files into one geoJSON file (no plain json or csv).
* We also have a tool to turn esri json to geojson should work in the browser, in a worker, and in node.

```javascript
var geoJSON = toGeoJSON(esriJSON);
//or
var geoJSON,cb=function(err, data){geoJSON=data};
toGeoJSON(esriJSON,cb);
//or
var geoJSON,cb=function(err, data){geoJSON=data};
toGeoJSON("same/origin/url/to/esriJSON",cb);
//fin
```

you can install on npm:

```shell
npm install esri2geo
```

from inside node:

```javascript
var esri2geo = require("esri2geo");
```



_Disclaimer:_ not endorsed by, or have anything to do with ESRI.