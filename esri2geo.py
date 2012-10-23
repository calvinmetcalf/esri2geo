import arcpy,json
wgs84="GEOGCS['GCS_WGS_1984',DATUM['D_WGS_1984',SPHEROID['WGS_1984',6378137.0,298.257223563]],PRIMEM['Greenwich',0.0],UNIT['Degree',0.0174532925199433]];-400 -400 1000000000;-100000 10000;-100000 10000;8.98315284119522E-09;0.001;0.001;IsHighPrecision"

def listFields(d):
    flds=arcpy.ListFields(d)
    out=dict()
    for f in flds:
        out[f.name]=f.type
    return out
def getShp(shp):
    desc = arcpy.Describe(shp)
    return desc.ShapeFieldName
def parseProp(row,t):
    p=dict()
    for e in t:
        if (t[e] != u'OID') and e != ('Shape_Length' or 'Shape_Area'):
            if row.getValue(e) != "":
                p[e]=row.getValue(e)
    return p
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
def parseGeo(g):
    geo=dict()
    t=g.type
    if t in ("multipatch", "dimension", "annotation"):
        return {}
    elif t == "point":
        geo["type"]="Point"
        geo["coordinates"]=[g.firstPoint.X,g.firstPoint.Y]
    elif t == "multipoint":
        if g.pointCount == 1:
            geo["type"]="Point"
            geo["coordinates"]=[g.firstPoint.X,g.firstPoint.Y]
        else:
            geo["type"]="MultiPoint"
            mp=[]
            n=g.pointCount
            i=0
            while i<n:
                p=g.getPart(i)
                mp.append([p.X,p.Y])
            geo["coordinates"]=mp
    elif t == "polyline":
        if g.partCount==1:
            geo["type"]="LineString"
            geo["coordinates"]=parseLine(g.getPart(0))
        else:
            geo["type"]="MultiLineString"
            c=[]
            n=g.partCount
            i=0
            while i<n:
                c.append(parseLine(g.getPart(i)))
                i=i+1
            geo["coordinates"]=c
    elif t == "polygon":
        if g.partCount==1:
            geo["type"]="Polygon"
            geo["coordinates"]=[parsePoly(g.getPart(0))]
        else:
            geo["type"]="MultiPolygon"
            c=[]
            n=g.partCount
            i=0
            while i<n:
                c.append(parsePoly(g.getPart(i)))
                i=i+1
            geo["coordinates"]=c
    return geo
def toGeo(d,j):
    out=dict()
    out["type"]= "FeatureCollection"
    fl=listFields(d)
    f=[]
    sr=arcpy.SpatialReference()
    sr.loadFromString(wgs84)
    rows=arcpy.SearchCursor(d,"",sr)
    shp=getShp(d)
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
