esri2geo
========

Converts ESRI json to geojson, should work with donut polygons, due to how esri json handles hole geometry there is no easy way to convert to geojson whenthere are
holes and multiple polygons. Bassically geojson does it this way

    [
    [[polyring1],[holering1a],[holering1b]],
    [[polyring2],[holering2a],[holering2b]]
    ]

having a ring imidiatly followed by its holes. while with esrijson

    [
    [polyring1],[holering1a],[polyring2],[holering1b],[holering2a],[holering2b]
    ]
    
With the holes and polygons mixed together, but the polygons all going clockwise and the holes all going counter clockwise. The only way to check which polygon
a while is within is to check geographically which polygon it falls within. 