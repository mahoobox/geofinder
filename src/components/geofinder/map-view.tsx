"use client";

import { useEffect, useRef, useState } from "react";
import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMap,
} from "@vis.gl/react-google-maps";
import type { FeatureCollection } from "geojson";
import type { GeoCoordinates } from "@/lib/types";
import { AlertCircle, Loader2 } from "lucide-react";

type MapViewProps = {
  center: GeoCoordinates | null;
  geoJson: FeatureCollection | null;
  onMapClick: (coords: GeoCoordinates) => void;
};

function PolygonLayer({ geoJson }: { geoJson: FeatureCollection | null }) {
  const map = useMap();
  const [dataFeature, setDataFeature] = useState<google.maps.Data.Feature[]>([]);

  useEffect(() => {
    if (!map) return;

    // Clear previous polygons
    dataFeature.forEach((feature) => {
      map.data.remove(feature);
    });

    if (geoJson) {
      const features = map.data.addGeoJson(geoJson);
      setDataFeature(features);
      map.data.setStyle({
        fillColor: "hsl(var(--accent))",
        strokeColor: "hsl(var(--primary))",
        strokeWeight: 2,
        fillOpacity: 0.3,
      });

      // Zoom to polygon
      const bounds = new google.maps.LatLngBounds();
      map.data.forEach((feature) => {
        feature.getGeometry()?.forEachLatLng((latlng) => {
          bounds.extend(latlng);
        });
      });
      if (!bounds.isEmpty()) {
        map.fitBounds(bounds);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, geoJson]);

  return null;
}

export default function MapView({ center, geoJson, onMapClick }: MapViewProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const [mapCenter, setMapCenter] = useState({
    lat: -34.6037,
    lng: -58.3816,
  });

  const mapRef = useRef<google.maps.Map | null>(null);

  useEffect(() => {
    if (center && mapRef.current) {
        // Only pan if there's no GeoJSON to fit bounds to
        if (!geoJson) {
            mapRef.current.panTo(center);
        }
    }
  }, [center, geoJson]);

  if (!apiKey) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-muted p-8 text-center">
        <div className="flex flex-col items-center gap-4">
            <AlertCircle className="h-16 w-16 text-destructive"/>
            <h2 className="text-2xl font-bold">Configuración Requerida</h2>
            <p className="text-muted-foreground">
                La clave de API de Google Maps no está configurada. Por favor, añada
                <code className="bg-destructive/20 text-destructive-foreground p-1 rounded-md mx-1 font-mono">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code>
                a su archivo de entorno para mostrar el mapa.
            </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full relative">
       <APIProvider apiKey={apiKey} libraries={['marker']}>
        <Map
            ref={mapRef}
            defaultCenter={mapCenter}
            defaultZoom={12}
            minZoom={3}
            maxZoom={20}
            mapId="geofinder_map"
            className="w-full h-full border-none"
            gestureHandling={'greedy'}
            disableDefaultUI={true}
            onClick={(e) => {
                const lat = e.detail.latLng?.lat;
                const lng = e.detail.latLng?.lng;
                if(lat && lng) {
                    onMapClick({ lat, lng })
                }
            }}
        >
          {center && <AdvancedMarker position={center} />}
          <PolygonLayer geoJson={geoJson} />
        </Map>
       </APIProvider>
    </div>
  );
}
