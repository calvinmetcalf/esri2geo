//set the options
var center = new L.LatLng(42.3584308,-71.0597732);
var zoom = 8;
var url= "http://{s}.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png";
var options={
        subdomains:["otile1","otile2",/*"otile3",*/"otile4"],//we'd usually use all 4 but something is up with #3 at the moment
        attribution:"Tiles Courtesy of <a href='http://www.mapquest.com/' target='_blank'>MapQuest</a> <img src='http://developer.mapquest.com/content/osm/mq_logo.png'>"
    };
//create the tiles    
var tiles = new L.TileLayer(url,options);
//create the map
var m = new L.Map('map',{
    center:center,
    zoom:zoom,
    layers:[tiles]
    });
var gj =  new L.GeoJSON({ "type": "FeatureCollection",  "features": []},{pointToLayer:pl});
//create empty geojson object and add it to the map
m.addLayer(gj);
//create the popups
gj.on("featureparse", function (e) {
    if (e.properties){
        e.layer.bindPopup(makePop(e.properties));
    }
    if(e.properties.Progress&&e.layer.setStyle){
       if(e.properties.Progress==3){
        e.layer.setStyle({color:"#ff0000",fillOpacity:0.8,opacity:1});   
       }else if(e.properties.Progress==2){
        e.layer.setStyle({color:"#ffff00",fillOpacity:0.8,opacity:1});   
       }else if(e.properties.Progress==1){
        e.layer.setStyle({color:"#00ff00",fillOpacity:0.8,opacity:1});   
       }
    }else if(e.properties.Progress&&e.layer.setIcon){
       if(e.properties.Progress==3){
        e.layer.setIcon(new icon.red);   
       }else if(e.properties.Progress==2){
        e.layer.setIcon(new icon.yellow);   
       }else if(e.properties.Progress==1){
        e.layer.setIcon(new icon.green);   
       }
    }
});
var ibase = L.Icon.extend({shadowUrl:null,iconSize: new L.Point(9, 9),iconAnchor: new L.Point(0, 0)});
var icon={
    red:ibase.extend({iconUrl:"img/red.png"}),
    yellow:ibase.extend({iconUrl:"img/yellow.png"}),
    green:ibase.extend({iconUrl:"img/green.png"})
}
//get the current bounds
var bbox=m.getBounds().toBBoxString();
//the url. note we're only getting a subset of fields
var url = {};
url.line = "http://services.massdot.state.ma.us/ArcGIS/rest/services/Projects/Project_Lines/MapServer/0/query?"
url.point = "http://services.massdot.state.ma.us/ArcGIS/rest/services/Projects/Project_Points/MapServer/0/query?"
url.fields="ProjectNumber,District,Location,ProjectType,CompletionDate,BudgetSource,Department,Progress"
url.where="Status%3D%27Active%27"
url.end = "&f=json&outSR=4326&inSR=4326&geometryType=esriGeometryEnvelope&geometry="
//get the features
getLayers(bbox);
//this is the call back from the jsonp ajax request
function parseJSONP(data){
/*you'd think you'd want to put the command to clear the old layer here instead of after zooming, but the markers are not not visible when you zoom, so it ends up being much less noticeable clearing them earlier*/
toGeoJSON(data,function(d){gj.addGeoJSON(d)});
}
//set up listeners on both drag and zoom events
m.on("dragend",redo);
m.on("zoomend",redo);
//the function called by those event listeners
function redo(){
    bbox=m.getBounds().toBBoxString();//get the new bounds
    gj.clearLayers();//clear the current layers
   getLayers(bbox);//ajax request
}
//the function called earlier to make the popup, it goes through all the attributes and makes them into a nice key value list
function makePop(p){
var a = [];
 for(var key in p){
     a.push(key+": "+p[key]);
 }
 return a.join("<br/>");
};
function getLayers(bbox){
    $.get(url.point+"outFields="+url.fields+"&where="+url.where+url.end+bbox,parseJSONP,"JSONP");
    $.get(url.line+"outFields="+url.fields+"&where="+url.where+url.end+bbox,parseJSONP,"JSONP");
}
function pl(latlng){
    return new L.Marker(latlng);
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
         url.where="Status%3D%27Active%27"
      }else{
        url.where="Status%3D%27Active%27%20AND%20Progress%3D"+val;  
      }
      redo()
    })