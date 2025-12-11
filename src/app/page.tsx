"use client";

import { useState } from "react";
import type { FeatureCollection } from "geojson";

import { getParcelData } from "@/app/actions";
import ControlPanel from "@/components/geofinder/control-panel";
import MapView from "@/components/geofinder/map-view";
import Header from "@/components/geofinder/header";
import { useToast } from "@/hooks/use-toast";
import type { GeoCoordinates } from "@/lib/types";

export default function Home() {
  const [coordinates, setCoordinates] = useState<GeoCoordinates | null>(null);
  const [geoJson, setGeoJson] = useState<FeatureCollection | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleQuery = async (coords: GeoCoordinates) => {
    setIsLoading(true);
    setGeoJson(null);
    setCoordinates(coords);

    try {
      const result = await getParcelData(coords.lat, coords.lng);
      if (result.error) {
        toast({
          variant: "destructive",
          title: "Error en la consulta",
          description: result.error,
        });
        setGeoJson(null);
      } else if (result.data) {
        setGeoJson(result.data);
        toast({
          title: "Consulta exitosa",
          description: "Se encontró el polígono de la parcela.",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error inesperado",
        description:
          "Ocurrió un error al procesar la solicitud. Por favor, inténtelo de nuevo.",
      });
      setGeoJson(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMapClick = (coords: GeoCoordinates) => {
    setCoordinates(coords);
  };

  const handleClear = () => {
    setCoordinates(null);
    setGeoJson(null);
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      <Header />
      <main className="flex-1 grid grid-cols-1 md:grid-cols-[400px_1fr] overflow-hidden">
        <ControlPanel
          coordinates={coordinates}
          setCoordinates={setCoordinates}
          geoJson={geoJson}
          isLoading={isLoading}
          onQuery={handleQuery}
          onClear={handleClear}
        />
        <MapView
          center={coordinates}
          geoJson={geoJson}
          onMapClick={handleMapClick}
        />
      </main>
    </div>
  );
}
