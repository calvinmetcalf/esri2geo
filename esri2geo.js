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
        var ccc= dP(geometry.rings);
        var d = ccc[0];
        var dd = ccc[1];
        var r=[];
        if(dd.length===0){
            var l2 = d.length;
            var i3 = 0;
            while(l2>i3){
             r.push([d[i3]]);   
            }
            return { "type": "MultiPolygon","coordinates":r}; 
        }else if(d.length===1){
            dd.unshift(d[0]);
            return {"type": "Polygon","coordinates": dd};
            
        }else{
            return { "type": "MultiPolygon","coordinates":d, "holes":dd};
        }  
    }
}
function dP(a){
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
 var l = a.length-1;
 var i = 0;
 var o=0;

 while(l>i){
 o+=(a[i][0]*a[i+1][1]-a[i+1][0]*a[i][1]);
   
     i++;
 }
    return o<=0;
}   
return outPut;  
}

