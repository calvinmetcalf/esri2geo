esri2geo
========


Looking for the esri toolbox? It's over at [it's own repo](https://github.com/calvinmetcalf/esri2open) to hopefully merge with [@feomike's version](https://github.com/feomike/esri2open)
Here have a tool to turn esri json to geojson should work in the browser, in a worker, and in node.


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