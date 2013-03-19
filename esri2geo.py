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
    donut=[]
    while i<polyCount:
        pt=poly[i]
        if pt:
            out.append([pt.X,pt.Y])
        else:
            donut.append(out) if len(out)>3 else True
            out=[]
        i+=1
    donut.append(out) if len(out)>3 else True
    return donut
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
            geo["type"]="Polygon"
            geo["coordinates"]=parsePoly(geometry.getPart(0))
        else:
            geo["type"]="MultiPolygon"
            polys=[]
            polyCount=geometry.partCount
            i=0
            while i<polyCount:
                polyPart = parsePoly(geometry.getPart(i))
                if polyPart:
                    polys.append(polyPart)
                i+=1
            geo["coordinates"]=polys
            if len(geo["coordinates"])==1:
                geo["coordinates"]=geo["coordinates"][0]
                geo["type"]="Polygon"
    return geo
def toGeoJSON(featureClass, outJSON, fileType="GeoJSON"):
    fileType = fileType.lower()
    featureCount = int(arcpy.GetCount_management(featureClass).getOutput(0))
    #arcpy.gMessage("parsing "+str(featureCount)+"features")
    if outJSON[-len(fileType)-1:]!="."+fileType:
        outJSON = outJSON+"."+fileType
    out=open(outJSON,"wb")
    fields=listFields(featureClass)
    shp=getShp(featureClass)
    oid=getOID(fields)
    if fileType=="geojson":
        out.write("""{"type":"FeatureCollection",features:[""")
    elif fileType=="csv":
        fieldNames = []
        for field in fields:
            if (fields[field] != u'OID') and field.lower() not in ('shape_length','shape_area',shp.lower()):
                fieldNames.append(field)
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
    try:
        for row in rows:
            fc={"type": "Feature"}
            fc["geometry"]=parseGeo(row.getValue(shp))
            fc["id"]=row.getValue(oid)
            if len(fc["geometry"]["coordinates"])==0:
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
                fc["properties"]["geometry"]=str(fc["geometry"])
                outCSV.writerow(fc["properties"])
            elif fileType=="json":
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
