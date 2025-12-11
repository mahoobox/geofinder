
"use client";

import { useState } from "react";
import type { FeatureCollection } from "geojson";
import dynamic from 'next/dynamic';

import { getParcelData } from "@/app/actions";
import ControlPanel from "@/components/geofinder/control-panel";
import Header from "@/components/geofinder/header";
import { useToast } from "@/hooks/use-toast";
import type { GeoCoordinates } from "@/lib/types";
import { Skeleton } from "@/components/ui/skeleton";

const MapView = dynamic(() => import('@/components/geofinder/map-view'), {
  ssr: false,
  loading: () => <div className="h-full w-full bg-muted flex items-center justify-center"><Skeleton className="h-full w-full" /></div>,
});


export default function Home() {
  const [coordinates, setCoordinates] = useState<GeoCoordinates | null>(null);
  const [geoJson, setGeoJson] = useState<FeatureCollection | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleQuery = async (coords: GeoCoordinates) => {
    setIsLoading(true);
    setGeoJson(null);
    setCoordinates(coords);

    console.log("Iniciando consulta en el cliente con coordenadas:", coords);

    try {
      const result = await getParcelData(coords[0], coords[1]);
      
      console.log("Respuesta recibida en el cliente:", result);

      if (result.error) {
        console.error("Error devuelto por la acción del servidor:", result.error);
        toast({
          variant: "destructive",
          title: "Error en la consulta",
          description: result.error,
        });
        setGeoJson(null);
      } else if (result.data) {
        console.log("Datos GeoJSON recibidos:", result.data);
        setGeoJson(result.data);
        toast({
          title: "Consulta exitosa",
          description: "Se encontró el polígono de la parcela.",
        });
      }
    } catch (error) {
      console.error("Error inesperado en el cliente al procesar la solicitud:", error);
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
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <div className="md:w-[400px] md:flex-shrink-0 flex-1 flex flex-col overflow-y-auto">
          <ControlPanel
            coordinates={coordinates}
            setCoordinates={setCoordinates}
            geoJson={geoJson}
            isLoading={isLoading}
            onQuery={handleQuery}
            onClear={handleClear}
          />
        </div>
        <div className="flex-1 md:order-first h-64 md:h-full w-full">
            <MapView
              center={coordinates}
              geoJson={geoJson}
              onMapClick={handleMapClick}
            />
        </div>
      </main>
    </div>
  );
}
