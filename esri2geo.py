import arcpy,json,os,csv,datetime
#uncomment the following line and comment the final line to use in the console
#arcpy.env.workspace = os.getcwd()
wgs84="GEOGCS['GCS_WGS_1984',DATUM['D_WGS_1984',SPHEROID['WGS_1984',6378137.0,298.257223563]],PRIMEM['Greenwich',0.0],UNIT['Degree',0.0174532925199433]];-400 -400 1000000000;-100000 10000;-100000 10000;8.98315284119522E-09;0.001;0.001;IsHighPrecision"

def listFields(featureClass):
    fields=arcpy.ListFields(featureClass)
    out=dict()
    for fld in fields:
        out[fld.name]=fld.type
    return out
def getShp(shp):
    desc = arcpy.Describe(shp)
    return desc.ShapeFieldName
def getOID(fields):
    for key, value in fields.items():
        if value== u'OID':
            return key
def parseProp(row,fields):
    out=dict()
    for field in fields:
        if (fields[field] != u'OID') and field.lower() not in ('shape_length','shape_area','shape') and row.getValue(field) is not None:
            if fields[field] == "Date":
                value = str(row.getValue(field).date())
            elif fields[field] == "String":
                value = row.getValue(field).strip()
            else:
                value = row.getValue(field)
            if value != "":
                out[field]=value
    return out
def parseLine(line):
    out=[]
    lineCount=line.count
    i=0
    while i<lineCount:
        pt=line[i]
        out.append([pt.X,pt.Y])
        i+=1
    return out
def parsePoly(poly):
    out=[]
    polyCount=poly.count
    i=0
    polys=[]
    while i<polyCount:
        pt=poly[i]
        if pt:
            out.append([pt.X,pt.Y])
        else:
            polys.append(out)
            out=[]
        i+=1
    polys.append(out)
    if len(polys[0])<4:
        return ["Point",polys[0][0]]
    return ["Polygon",polys]
def parseGeo(geometry):
    geo=dict()
    geoType=geometry.type
    if geoType in ("multipatch", "dimension", "annotation"):
        return {}
    elif geoType == "point":
        geo["type"]="Point"
        geo["coordinates"]=[geometry.firstPoint.X,geometry.firstPoint.Y]
    elif geoType == "multipoint":
        if geometry.pointCount == 1:
            geo["type"]="Point"
            geo["coordinates"]=[geometry.firstPoint.X,geometry.firstPoint.Y]
        else:
            geo["type"]="MultiPoint"
            points=[]
            pointCount=geometry.pointCount
            i=0
            while i<pointCount:
                point=geometry.getPart(i)
                points.append([point.X,point.Y])
                i+=1
            geo["coordinates"]=points
    elif geoType == "polyline":
        if geometry.partCount==1:
            geo["type"]="LineString"
            geo["coordinates"]=parseLine(geometry.getPart(0))
        else:
            geo["type"]="MultiLineString"
            lines=[]
            lineCount=geometry.partCount
            i=0
            while i<lineCount:
                lines.append(parseLine(geometry.getPart(i)))
                i+=1
            geo["coordinates"]=lines
    elif geoType == "polygon":
        if geometry.partCount==1:
            outPoly = parsePoly(geometry.getPart(0))
            geo["type"]=outPoly[0]
            geo["coordinates"]=outPoly[1]
            return geo
        else:
            geo["type"]="MultiPolygon"
            polys=[]
            points=[]
            polyCount=geometry.partCount
            i=0
            while i<polyCount:
                polyPart = parsePoly(geometry.getPart(i))
                if polyPart[0]=="Polygon":
                    polys.append(polyPart[1])
                if polyPart[0]=="Point":
                    points.append(polyPart[1])
                i+=1
            if polys:
                geo["coordinates"]=polys
                if len(geo["coordinates"])==1:
                    geo["coordinates"]=geo["coordinates"][0]
                    geo["type"]="Polygon"
            if points:
                pointGeo={}
                pointGeo["coordinates"]=points
                if len(pointGeo["coordinates"])==1:
                    pointGeo["coordinates"]=pointGeo["coordinates"][0]
                    pointGeo["type"]="Point"
                else:
                    pointGeo["type"]="MultiPoint"
            if polys and not points:
                return geo
            elif points and not polys:
                return pointGeo
            elif points and polys:
                out = {}
                out["type"]="GeometryCollection"
                out["geometries"]=[geo,pointGeo]
                return out
            else:
                return None
def toGeoJSON(featureClass, outJSON,includeGeometry="true"):
    includeGeometry = (includeGeometry=="true")
    if outJSON[-8:].lower()==".geojson":
        fileType = "geojson"
    elif outJSON[-5:].lower()==".json":
        fileType = "json"
    elif outJSON[-4:].lower()==".csv":
        fileType = "csv"
    featureCount = int(arcpy.GetCount_management(featureClass).getOutput(0))
    arcpy.AddMessage("Found "+str(featureCount)+" features")
    if outJSON[-len(fileType)-1:]!="."+fileType:
        outJSON = outJSON+"."+fileType
    out=open(outJSON,"wb")
    fields=listFields(featureClass)
    shp=getShp(featureClass)
    oid=getOID(fields)
    if fileType=="geojson":
        out.write("""{"type":"FeatureCollection","features":[""")
        if not includeGeometry:
            arcpy.AddMessage("it's geojson, we have to include the geometry")
    elif fileType=="csv":
        fieldNames = []
        for field in fields:
            if (fields[field] != u'OID') and field.lower() not in ('shape_length','shape_area',shp.lower()):
                fieldNames.append(field)
        if includeGeometry:
            fieldNames.append("geometry")
        outCSV=csv.DictWriter(out,fieldNames,extrasaction='ignore')
        fieldObject = {}
        for fieldName in fieldNames:
            fieldObject[fieldName]=fieldName
        outCSV.writerow(fieldObject)
    elif fileType=="json":
        out.write("""{"rows":[""")
    sr=arcpy.SpatialReference()
    sr.loadFromString(wgs84)
    rows=arcpy.SearchCursor(featureClass,"",sr)
    del fields[shp]
    first = True
    i=0
    try:
        for row in rows:
            i+=1
            arcpy.AddMessage("on "+str(i)+" of " + str(featureCount))
            fc={"type": "Feature"}
            fc["geometry"]=parseGeo(row.getValue(shp))
            fc["id"]=row.getValue(oid)
            if fc["geometry"] is None:
                continue
            fc["properties"]=parseProp(row,fields)
            if fileType=="geojson":
                if first:
                    first=False
                    json.dump(fc,out)
                else:
                    out.write(",")
                    json.dump(fc,out)
            elif fileType=="csv":
                if includeGeometry:
                    fc["properties"]["geometry"]=str(fc["geometry"])
                outCSV.writerow(fc["properties"])
            elif fileType=="json":
                if includeGeometry:
                    fc["properties"]["geometry"]=str(fc["geometry"])
                if first:
                    first=False
                    json.dump(fc["properties"],out)
                else:
                    out.write(",")
                    json.dump(fc["properties"],out)
    except Exception as e:
        print("OH SNAP! " + str(e))
    finally:
        del row
        del rows
        if fileType=="geojson" or fileType=="json":
            out.write("""]}""")
        out.close()
toGeoJSON(arcpy.GetParameterAsText(0),arcpy.GetParameterAsText(1),arcpy.GetParameterAsText(2))
