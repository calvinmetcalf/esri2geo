from arcpy import GetParameterAsText
from esri2geo import toGeoJSON
from os import path
def getName(feature):
    name = path.splitext(path.split(feature)[1])
    if name[1]:
        if name[1]==".shp":
            return name[0]
        else:
            return name[1][1:]
    else:
        return name[0]
    
features = GetParameterAsText(0).split(";")
outFolder = GetParameterAsText(1)
outType = GetParameterAsText(2)
includeGeometries = GetParameterAsText(3)
for feature in features:
    toGeoJSON(feature,outFolder+"//"+getName(feature)+"."+outType,includeGeometries)