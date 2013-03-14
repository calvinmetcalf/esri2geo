import arcpy,json
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
def parseProp(row,t):
    out=dict()
    for e in t:
        if (t[e] != u'OID') and e != ('Shape_Length' or 'Shape_Area'):
            if row.getValue(e) is not None and row.getValue(e) != "":
                out[e]=row.getValue(e)
    return out
def parseLine(l):
    out=[]
    n=l.count
    i=0
    while i<n:
        p=l[i]
        out.append([p.X,p.Y])
        i=i+1
    return out
def parsePoly(l):
    out=[]
    n=l.count
    i=0
    while i<n:
        p=l[i]
        out.append([p.X,p.Y])
        i=i+1
    return out
def parseGeo(geometry):
    geo=dict()
    t=geometry.type
    if t in ("multipatch", "dimension", "annotation"):
        return {}
    elif t == "point":
        geo["type"]="Point"
        geo["coordinates"]=[geometry.firstPoint.X,geometry.firstPoint.Y]
    elif t == "multipoint":
        if geometry.pointCount == 1:
            geo["type"]="Point"
            geo["coordinates"]=[geometry.firstPoint.X,geometry.firstPoint.Y]
        else:
            geo["type"]="MultiPoint"
            mp=[]
            n=geometry.pointCount
            i=0
            while i<n:
                p=geometry.getPart(i)
                mp.append([p.X,p.Y])
            geo["coordinates"]=mp
    elif t == "polyline":
        if geometry.partCount==1:
            geo["type"]="LineString"
            geo["coordinates"]=parseLine(geometry.getPart(0))
        else:
            geo["type"]="MultiLineString"
            c=[]
            n=geometry.partCount
            i=0
            while i<n:
                c.append(parseLine(geometry.getPart(i)))
                i=i+1
            geo["coordinates"]=c
    elif t == "polygon":
        if geometry.partCount==1:
            geo["type"]="Polygon"
            geo["coordinates"]=[parsePoly(geometry.getPart(0))]
        else:
            geo["type"]="MultiPolygon"
            c=[]
            n=geometry.partCount
            i=0
            while i<n:
                c.append(parsePoly(geometry.getPart(i)))
                i=i+1
            geo["coordinates"]=c
    return geo
def toGeo(featureClass,j):
    out=dict()
    out["type"]= "FeatureCollection"
    fl=listFields(featureClass)
    f=[]
    sr=arcpy.SpatialReference()
    sr.loadFromString(wgs84)
    rows=arcpy.SearchCursor(featureClass,"",sr)
    shp=getShp(featureClass)
    del fl[shp]
    try:
        for row in rows:
            fc={"type": "Feature"}
            fc["geometry"]=parseGeo(row.getValue(shp))
            fc["properties"]=parseProp(row,fl)
            f.append(fc)
    except:
        print "OH SNAP!"
    finally:
        del row
        del rows
    out["features"]=f
    json.dump(out,open(j,"w"))
toGeo(arcpy.GetParameterAsText(0),arcpy.GetParameterAsText(1))
