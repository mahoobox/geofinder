"use client";

import { useEffect, useState } from "react";
import { Map, Marker, GeoJson } from "pigeon-maps";
import { osm } from 'pigeon-maps/providers'
import type { FeatureCollection, Polygon, MultiPolygon } from "geojson";
import type { GeoCoordinates } from "@/lib/types";

type MapViewProps = {
  center: GeoCoordinates | null;
  geoJson: FeatureCollection | null;
  onMapClick: (coords: GeoCoordinates) => void;
};

export default function MapView({ center, geoJson, onMapClick }: MapViewProps) {
  const [mapCenter, setMapCenter] = useState<GeoCoordinates>([-34.6037, -58.3816]);
  const [zoom, setZoom] = useState(12);

  useEffect(() => {
    if (geoJson && geoJson.features.length > 0) {
      // Very basic bounding box calculation
      let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;

      const processCoords = (coords: any[]) => {
        coords.forEach(c => {
          if (Array.isArray(c) && typeof c[0] === 'number' && typeof c[1] === 'number') {
            const [lng, lat] = c;
            minLng = Math.min(minLng, lng);
            maxLng = Math.max(maxLng, lng);
            minLat = Math.min(minLat, lat);
            maxLat = Math.max(maxLat, lat);
          } else {
             processCoords(c);
          }
        });
      };
      
      geoJson.features.forEach(feature => {
          if (feature.geometry) {
             processCoords(feature.geometry.coordinates);
          }
      });

      if (isFinite(minLat) && isFinite(maxLat) && isFinite(minLng) && isFinite(maxLng)) {
        setMapCenter([(minLat + maxLat) / 2, (minLng + maxLng) / 2]);
        // Basic zoom level estimation
        const latDiff = Math.abs(maxLat - minLat);
        const lngDiff = Math.abs(maxLng - minLng);
        const maxDiff = Math.max(latDiff, lngDiff);
        const newZoom = Math.floor(Math.log2(360 / maxDiff));
        setZoom(Math.min(newZoom, 18)); // Cap zoom level
      }

    } else if (center) {
      setMapCenter(center);
      setZoom(15);
    }
  }, [geoJson, center]);

  const handleMapClick = ({ latLng }: { latLng: [number, number] }) => {
    onMapClick(latLng);
  };
  
  const geoJsonStyle = {
    fillColor: "hsl(var(--accent))",
    strokeColor: "hsl(var(--primary))",
    strokeWidth: 2,
    fillOpacity: 0.3,
  };

  return (
    <div className="h-full w-full">
      <Map
        provider={osm}
        center={mapCenter}
        zoom={zoom}
        onClick={handleMapClick}
        height_={"100%"}
      >
        {center && <Marker width={40} anchor={center} color="hsl(var(--primary))" />}
        {geoJson && 
            <GeoJson 
                data={geoJson} 
                styleCallback={(feature, hover) => {
                    if (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon') {
                        return geoJsonStyle;
                    }
                    return { strokeWidth: '0' }; // Don't render points or lines
                }}
            />
        }
      </Map>
    </div>
  );
}
