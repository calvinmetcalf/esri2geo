esri2geo
========

Converts ESRI json to geojson, should work with donut polygons as [a tool that esri wrote](https://github.com/Esri/geojson-utils) imlies we can assume holes in donut polygons imidiatly follow their other ring.

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

Bonus! Because all the tools I could find all required installing stuff, I wront my own arcpy tool so that we can convert any arcgis feature thingy.  Only tested in 10.0.

_Disclaimer:_ not endorsed by, or have anything to do with ESRI.