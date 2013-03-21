from arcpy import GetParameterAsText
from esri2geo import toGeoJSON
toGeoJSON(GetParameterAsText(0),GetParameterAsText(1),GetParameterAsText(2))