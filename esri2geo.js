function toGeoJSON(data){
    var outPut = { "type": "FeatureCollection",
  "features": []};
    var fl = data.features.length;
    var i = 0;
    while(fl>i){
     var ft = data.features[i];
     var outFT = {
            "type": "Feature",
            "properties":ft.attributes
        };
        if(ft.geometry.x){
          outFT.geometry=point(ft.geometry);
        }else if(ft.geometry.points){
            outFT.geometry=points(ft.geometry);
            }else if(ft.geometry.paths){
         outFT.geometry=line(ft.geometry);
        }else if(ft.geometry.rings){
           outFT.geometry=poly(ft.geometry);  
        }
        
     outPut.features.push(outFT);
     i++;
    }
function point(geometry){
    return {"type": "Point","coordinates": [geometry.x,geometry.y]};    
}
function points(geometry){
    if(geometry.points.length===1){
        return {"type": "Point","coordinates": geometry.points[0]};
    }else{
        return { "type": "MultiPoint","coordinates":geometry.points}; 
    }
}
function line(geometry){
    if(geometry.paths.length===1){
        return {"type": "LineString","coordinates": geometry.paths[0]};
    }else{
        return { "type": "MultiLineString","coordinates":geometry.paths}; 
    }
}
function poly(geometry){
    if(geometry.rings.length===1){
        return {"type": "Polygon","coordinates": geometry.rings};
    }else{
        var r = [];
        var l = geometry.rings.length;
        var ii = 0;
        while(l>ii){
         r.push([geometry.rings[ii]]);
         ii++;
        }
        return { "type": "MultiPolygon","coordinates":r}; 
    }
}
    
    
return outPut;  
}