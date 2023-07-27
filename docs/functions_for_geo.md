# Geo Location

### point_in_polygon

Checks whether the point belongs to the polygon. `point_in_polygon((x,y),[(a,b),(c,d)..])` e.g. `SELECT point_in_polygon((3., 3.), [(6, 0), (8, 4), (5, 8), (0, 2)]) AS res` returns `1` since the point (3,3) is in the defined polygon.



### geo_distance

Calculates the distance on WGS-84 ellipsoid. `geo_distance(lon1,lat1,lon2,lat2)`