"use client";

import { useEffect, useRef, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  GeoJSON,
  useMap,
} from "react-leaflet";
import type { FeatureCollection } from "geojson";
import type { GeoCoordinates } from "@/lib/types";
import L from "leaflet";

// Fix for default icon issues with webpack
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});


type MapViewProps = {
  center: GeoCoordinates | null;
  geoJson: FeatureCollection | null;
  onMapClick: (coords: GeoCoordinates) => void;
};

function MapClickHandler({
  onMapClick,
}: {
  onMapClick: (coords: GeoCoordinates) => void;
}) {
  useMap().on("click", (e) => {
    onMapClick(e.latlng);
  });
  return null;
}

function ChangeView({ center, zoom }: { center: L.LatLngExpression; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);
  return null;
}

function GeoJsonLayer({ geoJson }: { geoJson: FeatureCollection | null }) {
  const map = useMap();

  useEffect(() => {
    if (geoJson && map) {
      const geoJsonLayer = L.geoJSON(geoJson);
      const bounds = geoJsonLayer.getBounds();
      if (bounds.isValid()) {
        map.fitBounds(bounds);
      }
    }
  }, [geoJson, map]);

  if (!geoJson) {
    return null;
  }
  
  const style = {
    fillColor: "hsl(var(--accent))",
    weight: 2,
    opacity: 1,
    color: "hsl(var(--primary))",
    fillOpacity: 0.3,
  };

  return <GeoJSON data={geoJson} style={style} />;
}


export default function MapView({ center, geoJson, onMapClick }: MapViewProps) {
  const [isClient, setIsClient] = useState(false);
  const defaultCenter: L.LatLngExpression = [ -34.6037, -58.3816 ];
  const mapRef = useRef<L.Map>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (center && mapRef.current && !geoJson) {
      mapRef.current.panTo(center);
    }
  }, [center, geoJson]);

  if (!isClient) {
    return null;
  }

  return (
    <MapContainer
      ref={mapRef}
      center={defaultCenter}
      zoom={12}
      className="w-full h-full border-none"
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapClickHandler onMapClick={onMapClick} />
      {center && <Marker position={center} />}
      <GeoJsonLayer geoJson={geoJson} />
    </MapContainer>
  );
}
