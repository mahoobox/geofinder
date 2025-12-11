import type { FeatureCollection, Polygon, MultiPolygon } from 'geojson';

function coordinatesToKml(coordinates: number[][]): string {
  return coordinates.map(coord => `${coord[0]},${coord[1]},0`).join(' ');
}

export function geojsonToKml(geojson: FeatureCollection): string {
  let kmlPolygons = '';

  geojson.features.forEach(feature => {
    if (feature.geometry.type === 'Polygon') {
      const geom = feature.geometry as Polygon;
      const outerBoundary = coordinatesToKml(geom.coordinates[0]);
      const innerBoundaries = geom.coordinates.slice(1).map(ring => 
        `<innerBoundaryIs><LinearRing><coordinates>${coordinatesToKml(ring)}</coordinates></LinearRing></innerBoundaryIs>`
      ).join('');

      kmlPolygons += `
        <Placemark>
          <name>${feature.properties?.name || 'Parcela'}</name>
          <Polygon>
            <outerBoundaryIs>
              <LinearRing>
                <coordinates>${outerBoundary}</coordinates>
              </LinearRing>
            </outerBoundaryIs>
            ${innerBoundaries}
          </Polygon>
        </Placemark>`;
    } else if (feature.geometry.type === 'MultiPolygon') {
        const geom = feature.geometry as MultiPolygon;
        geom.coordinates.forEach(polygonCoords => {
            const outerBoundary = coordinatesToKml(polygonCoords[0]);
            const innerBoundaries = polygonCoords.slice(1).map(ring => 
                `<innerBoundaryIs><LinearRing><coordinates>${coordinatesToKml(ring)}</coordinates></LinearRing></innerBoundaryIs>`
            ).join('');

            kmlPolygons += `
            <Placemark>
              <name>${feature.properties?.name || 'Parcela'}</name>
              <Polygon>
                <outerBoundaryIs>
                  <LinearRing>
                    <coordinates>${outerBoundary}</coordinates>
                  </LinearRing>
                </outerBoundaryIs>
                ${innerBoundaries}
              </Polygon>
            </Placemark>`;
        });
    }
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Datos de Parcela</name>
    <description>Polígono de parcela exportado desde GeoFinder.</description>
    <Style id="customStyle">
      <LineStyle>
        <color>ff5b7ba6</color> <!-- A67B5B in KML format (aabbggrr) -->
        <width>2</width>
      </LineStyle>
      <PolyStyle>
        <color>4d73a3d9</color> <!-- D9A373 with 30% opacity -->
        <fill>1</fill>
        <outline>1</outline>
      </PolyStyle>
    </Style>
    <Folder>
      <name>Polígonos de Parcela</name>
      ${kmlPolygons}
    </Folder>
  </Document>
</kml>`;
}
