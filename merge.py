from arcpy import GetParameterAsText
from esri2geo import prepareGeoJson,writeFile,closeUp
features = GetParameterAsText(0).split(";")
outJSON=GetParameterAsText(1)
includeGeometry = True
fileType = "geojson"
out=open(outJSON,"wb")
prepareGeoJson(out)
for feature in features:
    if feature[0] in ("'",'"'):
        feature = feature[1:-1]
    writeFile(out,feature,fileType,includeGeometry)
closeUp(out,fileType)