var esri2geo = {};
(function () {
  function toGeoJSON(data, cb){
    if(typeof data === 'string'){
      if(cb){
        ajax(data, function(err, d){
        	toGeoJSON(d,cb);
        });
        return;
      }else{
        throw new TypeError('callback needed for url');
      }
    }
    var outPut = { "type": "FeatureCollection","features": []};
    var fl = data.features.length;
    var i = 0;
    while(fl>i){
      var ft = data.features[i];
      /* as only ESRI based products care if all the features are the same type of geometry, check for geometry type at a feature level*/
      var outFT = {
        "type": "Feature",
        "properties":prop(ft.attributes)
      };
      if(ft.geometry.x){
        //check if it's a point
        outFT.geometry=point(ft.geometry);
      }else if(ft.geometry.points){
        //check if it is a multipoint
        outFT.geometry=points(ft.geometry);
      }else if(ft.geometry.paths){
        //check if a line (or "ARC" in ESRI terms)
        outFT.geometry=line(ft.geometry);
      }else if(ft.geometry.rings){
        //check if a poly.
        outFT.geometry=poly(ft.geometry);
      }
      outPut.features.push(outFT);
      i++;
    }
    cb(null, outPut);
  }
  function point(geometry){
    //this one is easy
    return {"type": "Point","coordinates": [geometry.x,geometry.y]};  
  }
  function points(geometry){
    //checks if the multipoint only has one point, if so exports as point instead
    if(geometry.points.length===1){
      return {"type": "Point","coordinates": geometry.points[0]};
    }else{
      return { "type": "MultiPoint","coordinates":geometry.points}; 
    }
  }
  function line(geometry){
    //checks if their are multiple paths or just one
    if(geometry.paths.length===1){
      return {"type": "LineString","coordinates": geometry.paths[0]};
    }else{
      return { "type": "MultiLineString","coordinates":geometry.paths}; 
    }
  }
  function poly(geometry){
    //first we check for some easy cases, like if their is only one ring
    if(geometry.rings.length===1){
      return {"type": "Polygon","coordinates": geometry.rings};
    }else{
      /*if it isn't that easy then we have to start checking ring direction, basically the ring goes clockwise its part of the polygon,
      if it goes counterclockwise it is a hole in the polygon, but geojson does it by haveing an array with the first element be the polygons 
      and the next elements being holes in it*/
      return decodePolygon(geometry.rings);
    }
  }
  function decodePolygon(a){
    //returns the feature
    var coords = [],type;
    var len = a.length;
    var i = 0;
    var len2 = coords.length-1;
    while(len>i){
      if(ringIsClockwise(a[i])){
        coords.push([a[i]]);
        len2++;
      }else{
        coords[len2].push(a[i]);
      }
      i++;
    }
    if(coords.length===1){
      type="Polygon";
    }else{
      type="MultiPolygon";
    }
    return {"type":type,"coordinates":(coords.length===1)?coords[0]:coords};
  }
  /*determine if polygon ring coordinates are clockwise. clockwise signifies outer ring, counter-clockwise an inner ring
  or hole. this logic was found at http://stackoverflow.com/questions/1165647/how-to-determine-if-a-list-of-polygon-
  points-are-in-clockwise-order
  this code taken from http://esri.github.com/geojson-utils/src/jsonConverters.js by James Cardona (MIT lisense)
  */
  function ringIsClockwise(ringToTest) {
    var total = 0,
      i = 0,
      rLength = ringToTest.length,
      pt1 = ringToTest[i],
      pt2;
    for (i; i < rLength - 1; i++) {
      pt2 = ringToTest[i + 1];
      total += (pt2[0] - pt1[0]) * (pt2[1] + pt1[1]);
      pt1 = pt2;
    }
    return (total >= 0);
  }
  function prop(a){
    var p = {};
    for(var k in a){
      if(a[k]){
        p[k]=a[k];  
      }
    }
    return p;
  }


  function ajax(url, cb){
    if(typeof module !== "undefined"){
        var request = require("request");
        request(url,{json:true},function(e,r,b){
          cb(e,b);
        });
        return;
    }
    // the following is from JavaScript: The Definitive Guide
    var response;
    var req = new XMLHttpRequest();
    req.onreadystatechange = function() {
      if (req.readyState === 4 && req.status === 200) {
          cb(null, JSON.parse(req.responseText));
      }
    };
    req.open("GET", url);
    req.send();
  }
  if (typeof module !== "undefined"){
    module.exports = toGeoJSON;
  } else {
    esri2geo.toGeoJSON = toGeoJSON;
  }
}());