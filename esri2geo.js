function toGeoJSON(data,cb){
    var outPut = { "type": "FeatureCollection",
  "features": []};
    var fl = data.features.length;
    var i = 0;
    while(fl>i){
     var ft = data.features[i];
/* as only ESRI based products care if all the features are the same type of geometry, check for geometry type at a feature level*/
     var outFT = {
            "type": "Feature",
            "properties":prop(ft.attributes)
        };
        if(ft.attributes.OBJECTID){
         outFT.id=ft.attributes.OBJECTID;
        }
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
/*if it isn't that easy then we have to start checking ring direction, basically the ring goes clockwise its part of the polygon, if it goes counterclockwise it is a hole in the polygon, but geojson does it by haveing an array with the first element be the polygons and the next elements being holes in it*/
        var ccc= dP(geometry.rings);
        var d = ccc[0];
        var dd = ccc[1];
        var r=[];
        if(dd.length===0){
/*if their are no holes we don't need to worry about this, but do need to stuck each ring inside its own array*/
            var l2 = d.length;
            var i3 = 0;
            while(l2>i3){
             r.push([d[i3]]);   
            }
            return { "type": "MultiPolygon","coordinates":r}; 
        }else if(d.length===1){
/*if their is only one clockwise ring then we know all holes are in that poly*/
            dd.unshift(d[0]);
            return {"type": "Polygon","coordinates": dd};
            
        }else{
/*if their are multiple rings and holes we have no way of knowing which belong to which without looking at it specially, so just dump the coordinates and add  a hole field, this may cause errors*/
            return { "type": "MultiPolygon","coordinates":d, "holes":dd};
        }  
    }
}
function dP(a){
//returns an array of 2 arrays, the first being all the clockwise ones, the second counter clockwise
    var d = [];
        var dd =[];
        var l = a.length;
        var ii = 0;
        while(l>ii){
            if(c(a[ii])){
                d.push(a[ii]);
            }else{
             dd.push(a[ii]);
            }
         ii++;
        }
    return [d,dd];
}
function c(a){
//return true if clockwise
 var l = a.length-1;
 var i = 0;
 var o=0;

 while(l>i){
 o+=(a[i][0]*a[i+1][1]-a[i+1][0]*a[i][1]);
   
     i++;
 }
    return o<=0;
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
if(cb){
 cb(outPut)
}else{
return outPut;  
}
}