from arcpy import GetParameterAsText
from esri2geo import toOpen
toOpen(GetParameterAsText(0),GetParameterAsText(1),GetParameterAsText(2))