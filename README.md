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
a while is within is to check geographically which polygon it falls within, though the tool that [esri wrote](https://github.com/Esri/geojson-utils) implies that one can assume that holes follow the polygon. 

But wait there's more! Because all the tools I could find all required installing stuff, I wront my own arcpy tool so that we can convert any arcgis feature thingy.  Only tested in 10.0.

Copyright (c) 2012 Calvin Metcalf

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.