//set the options
var center = new L.LatLng(42.3584308,-71.0597732);
var zoom = 8;
var url= "http://{s}.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.jpeg";
var ac;
var sw=0;
var options={
        subdomains:["otile1","otile2","otile3","otile4"],
        attribution:"Tile Data from <a href='http://www.openstreetmap.org/' target='_blank'>OSM</a>, Tiles Courtesy of <a href='http://www.mapquest.com/' target='_blank'>MapQuest</a> <img src='http://developer.mapquest.com/content/osm/mq_logo.png'>"
    };
//create the tiles    
var tiles = new L.TileLayer(url,options);
//create the map
var m = new L.Map('map',{
    center:center,
    zoom:zoom,
    layers:[tiles]
    });
var g = L.layerGroup().addTo(m);
var gl =   L.geoJson({ "type": "FeatureCollection",  "features": []},{pointToLayer:pl,onEachFeature:gjon});
var gp =   L.geoJson({ "type": "FeatureCollection",  "features": []},{pointToLayer:pl,onEachFeature:gjon});
var lu= L.geoJson({ "type": "FeatureCollection",  "features": []},{pointToLayer:pl,onEachFeature:luon}).addTo(m);

function luon(e,l) {
    if (e.properties){
        l.bindPopup(makePop(e.properties));
    }if(l.setStyles){
     l.setStyle({color:"#0000ff",fillOpacity:1,opacity:1});   
    }
};
//create empty geojson object and add it to the map

//create the popups
function gjon(e,l) {
    if (e.properties){
        l.bindPopup(makePop(e.properties));
    }if(e.properties.Progress&&l.setRadius){
          if(e.properties.Progress==3){
        l.setStyle({color:"#000",fillColor:"#ff0000",fillOpacity:0.8,opacity:1,weight:1});   
       }else if(e.properties.Progress==2){
        l.setStyle({color:"#000",fillColor:"#ffff00",fillOpacity:0.8,opacity:1,weight:1});   
       }else if(e.properties.Progress==1){
        l.setStyle({color:"#000",fillColor:"#00ff00",fillOpacity:0.8,opacity:1,weight:1});   
       }
    }else if(e.properties.Progress&&l.setStyle){
       if(e.properties.Progress==3){
        l.setStyle({color:"#ff0000",fillOpacity:0.8,opacity:1});   
       }else if(e.properties.Progress==2){
        l.setStyle({color:"#ffff00",fillOpacity:0.8,opacity:1});   
       }else if(e.properties.Progress==1){
        l.setStyle({color:"#00ff00",fillOpacity:0.8,opacity:1});   
       }
      
    }
}

/*var icon={
    red:L.icon({iconUrl:"img/red.png",iconSize: L.point(9, 9)}),
    yellow:L.icon({iconUrl:"img/yellow.png",iconSize:  L.point(9, 9)}),
    green:L.icon({iconUrl:"img/green.png",iconSize:  L.point(9, 9)})
}*/
//get the current bounds
var bbox=/*m.getBounds().toBBoxString();*/"-76.1627197265625,40.052847601823984,-65.9564208984375,44.57873024377564";
//the url. note we're only getting a subset of fields
var url = {};
url.line = "http://services.massdot.state.ma.us/ArcGIS/rest/services/Projects/Project_Lines/MapServer/0/query?"
url.point = "http://services.massdot.state.ma.us/ArcGIS/rest/services/Projects/Project_Points/MapServer/0/query?"
url.fields="ProjectNumber,District,Location,ProjectType,CompletionDate,BudgetSource,Department,ProjectProgress,Progress"
url.where={"Status":"Active"};
url.setW=function(k,v){
 url.where[k]=v;   
}
url.rmW=function(k){
    delete url.where[k]
}
url.getW=function(){
    var a = [];
 for(var k in url.where){
     a.push(k+"%3D%27"+url.where[k]+"%27")
 }
 return a.join("%20AND%20")
}
url.end = "&f=json&outSR=4326&inSR=4326&geometryType=esriGeometryEnvelope&geometry="
//get the features
getLayers(bbox);
//this is the call back from the jsonp ajax request
function parsePoint(data){
/*you'd think you'd want to put the command to clear the old layer here instead of after zooming, but the markers are not not visible when you zoom, so it ends up being much less noticeable clearing them earlier*/
toGeoJSON(data,function(d){gp.addData(d)});
makeAuto(data);
}
function parseLine(data){
/*you'd think you'd want to put the command to clear the old layer here instead of after zooming, but the markers are not not visible when you zoom, so it ends up being much less noticeable clearing them earlier*/
toGeoJSON(data,function(d){gl.addData(d)});
makeAuto(data);
g.addLayer(gl).addLayer(gp);

}
//set up listeners on both drag and zoom events
//m.on("dragend",redo);
//m.on("zoomend",redo);
//the function called by those event listeners
function redo(){
    //bbox=m.getBounds().toBBoxString();
    g.clearLayers();
    gl.clearLayers();
    gp.clearLayers();
    //clear the current layers
   getLayers(bbox);//ajax request
}
//the function called earlier to make the popup, it goes through all the attributes and makes them into a nice key value list
function makePop(p){
var a = [];

 for(var key in p){
     if(key!=="Progress"){
         if(key=="CompletionDate"){
             var d =  new Date(parseInt(p[key]));
            a.push(key.replace(/(([a-z])([A-Z]))/g,"$2 $3")+": "+ d.toDateString());
             }else{
         
     a.push(key.replace(/(([a-z])([A-Z]))/g,"$2 $3")+": "+p[key]);
         }
     }
 }
 return a.join("<br/>");
};
function getLayers(bbox){
    ac={};
    $.get(url.point+"outFields="+url.fields+"&where="+url.getW()+url.end+bbox,parsePoint,"JSONP");
    $.get(url.line+"outFields="+url.fields+"&where="+url.getW()+url.end+bbox,parseLine,"JSONP");
}
function pl(f,latlng){
    return L.circleMarker(latlng,{radius:4});
}
$(function() {
        $( "#tabs" ).tabs({
        collapsible: true,
            selected: -1
        });
       $( "input:submit,input:reset" ).button();
        $('input, textarea').placeholder();
});
var marker = new L.Marker();
var old={};
function geocode(){
    old.center=m.getCenter();
    old.zoom=m.getZoom();
 var address =$("#address").val();
 var gURL = 'http://open.mapquestapi.com/nominatim/v1/search?countrycodes=us&exclude_place_ids=955483008,950010827&viewbox=-76.212158203125%2C44.46123053905882%2C-66.005859375%2C40.107487419012415&bounded=1&format=json&q='
  $.ajax({
       type: "GET",
       url: gURL + address,
       dataType: 'jsonp',
       jsonp: 'json_callback',
       success: function (data, textStatus) {
           if(textStatus=="success"){
          var latlng = new L.LatLng(data[0].lat, data[0].lon);
         marker.setLatLng(latlng);
        
         m.addLayer(marker);
         m.setView(latlng,17);
      
           }
       }
  });
  return false
}

function resetgeo(){
    m.removeLayer(marker);
    m.setView(old.center, old.zoom);
}
$("#geocoder").submit(geocode);
$("#resetgeo").click(resetgeo);
$("#getStatus").change(function(){
      var val = $("#getStatus").val();
      if(val==""){
        url.rmW("Progress");
      }else{
        url.setW("Progress",val)  
      }
      redo()
    });
$("#getDi").change(function(){
      var val = $("#getDi").val();
      if(val==""){
        url.rmW("Department");
      }else{
        url.setW("Department",val)  
      }
      redo()
    });
function makeAuto(d){
   var f= d.features;
   var len = d.features.length
   var i = 0;
   while(i<len){
       if(!ac[f[i].attributes.ProjectNumber]){
       ac[f[i].attributes.ProjectNumber]=d.geometryType;
       }
       i++;
    }
if(sw===0){sw++;}else if(sw===1){
    sw--;
    var a=[];
    for(var k in ac){
     a.push(k);   
    }
    
$("#ProjNum").autocomplete({source:a});
}
}
$("#ProjLookUp").submit(lookUp);
var b;
function lookUp(){
    b= [m.getCenter(),m.getZoom()];
    var t= {esriGeometryPoint:"point",esriGeometryPolyline:"line"}
    var v=$("#ProjNum").val();
    $.get(url[t[ac[v]]]+"outFields="+url.fields+"&where=ProjectNumber%3D%27"+v+"%27"+url.end+bbox,parseLookUp,"JSONP");
    function parseLookUp(data){
        toGeoJSON(data,function(d){
            lu.addData(d);
            m.fitBounds(lu.getBounds());
            });
    };
   
return false
}
$("#ProjReset").click(function(){
    lu.clearLayers();
    m.setView(b[0],b[1]);
    })