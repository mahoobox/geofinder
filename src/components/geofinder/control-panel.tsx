
"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import type { FeatureCollection } from "geojson";
import JSZip from "jszip";
import {
  ClipboardCopy,
  Download,
  Loader2,
  Search,
  Trash2,
  View,
  FileArchive,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { geojsonToKml } from "@/lib/kml";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import type { GeoCoordinates } from "@/lib/types";
import ParcelDetails from "./parcel-details";

type FormValues = {
  coords: string;
};

type ControlPanelProps = {
  coordinates: GeoCoordinates | null;
  setCoordinates: (coords: GeoCoordinates | null) => void;
  geoJson: FeatureCollection | null;
  isLoading: boolean;
  onQuery: (coords: GeoCoordinates) => void;
  onClear: () => void;
};

export default function ControlPanel({
  coordinates,
  setCoordinates,
  geoJson,
  isLoading,
  onQuery,
  onClear,
}: ControlPanelProps) {
  const [isGeoJsonDialogOpen, setIsGeoJsonDialogOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    defaultValues: {
      coords: "",
    },
  });

  useEffect(() => {
    if (coordinates) {
      form.setValue("coords", `${coordinates[0].toFixed(6)}, ${coordinates[1].toFixed(6)}`);
      form.clearErrors();
    } else {
      form.reset({ coords: "" });
    }
  }, [coordinates, form]);

  function onSubmit(values: FormValues) {
    const { coords } = values;
    if (!coords) {
        form.setError("coords", { message: "Se requieren coordenadas." });
        return;
    }

    const parts = coords.split(",").map(part => part.trim());
    
    if (parts.length !== 2) {
        form.setError("coords", { message: "Formato inválido. Use 'lat, lng'." });
        return;
    }

    const lat = parseFloat(parts[0]);
    const lng = parseFloat(parts[1]);

    if (isNaN(lat) || isNaN(lng)) {
        form.setError("coords", { message: "Coordenadas no válidas." });
        return;
    }

    if (lat < -90 || lat > 90) {
      form.setError("coords", { message: "Latitud debe estar entre -90 y 90." });
      return;
    }
    if (lng < -180 || lng > 180) {
      form.setError("coords", { message: "Longitud debe estar entre -180 y 180." });
      return;
    }
    onQuery([lat, lng]);
  }

  const handleCopyGeoJson = () => {
    if (!geoJson) return;
    navigator.clipboard.writeText(JSON.stringify(geoJson, null, 2));
    toast({
      title: "Copiado",
      description: "GeoJSON copiado al portapapeles.",
    });
  };

  const handleDownloadKml = () => {
    if (!geoJson) return;
    try {
      const kmlString = geojsonToKml(geoJson);
      const blob = new Blob([kmlString], { type: "application/vnd.google-earth.kml+xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "parcela.kml";
      document.body.appendChild(a);
a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
       toast({
        variant: "destructive",
        title: "Error de descarga",
        description: "No se pudo generar el archivo KML."
      });
    }
  };

  const handleDownloadKmz = async () => {
    if (!geoJson) return;
    try {
      const kmlString = geojsonToKml(geoJson);
      const zip = new JSZip();
      zip.file("doc.kml", kmlString);
      const blob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "parcela.kmz";
      document.body.appendChild(a);
a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error de descarga",
        description: "No se pudo generar el archivo KMZ.",
      });
    }
  };

  return (
    <div className="bg-card text-card-foreground md:border-r h-full flex flex-col p-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Entrada de Coordenadas</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormItem>
                  <FormLabel>Coordenadas (Lat, Lng)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="4.886458, -75.050740"
                      {...form.register("coords")}
                    />
                  </FormControl>
                    <FormDescription>
                      Pegue las coordenadas o seleccione un punto en el mapa.
                  </FormDescription>
                  <FormMessage>{form.formState.errors.coords?.message}</FormMessage>
                </FormItem>
                <div className="flex flex-wrap gap-2">
                  <Button type="submit" disabled={isLoading} className="flex-grow bg-accent hover:bg-accent/90">
                    {isLoading ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      <Search />
                    )}
                    Consultar Parcela
                  </Button>
                    <Button
                    type="button"
                    variant="outline"
                    onClick={onClear}
                    disabled={isLoading}
                    aria-label="Limpiar selección"
                  >
                    <Trash2 />
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {geoJson && (
          <>
            <ParcelDetails feature={geoJson.features[0]} />

            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Opciones de Datos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">Visualice o descargue los datos del polígono de la parcela.</p>
                <div className="flex flex-wrap gap-2">
                    <Dialog open={isGeoJsonDialogOpen} onOpenChange={setIsGeoJsonDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="secondary" className="flex-grow">
                          <View />
                          Ver GeoJSON
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl">
                        <DialogHeader>
                          <DialogTitle>Datos GeoJSON de la Parcela</DialogTitle>
                        </DialogHeader>
                        <div className="relative">
                          <ScrollArea className="h-96 w-full rounded-md border p-4 font-code text-sm">
                            <pre>{JSON.stringify(geoJson, null, 2)}</pre>
                          </ScrollArea>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="absolute top-2 right-2 h-8 w-8"
                            onClick={handleCopyGeoJson}
                          >
                            <ClipboardCopy className="h-4 w-4" />
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button onClick={handleDownloadKml} variant="secondary" className="flex-grow">
                      <Download />
                      Descargar KML
                    </Button>
                      <Button onClick={handleDownloadKmz} variant="secondary" className="flex-grow">
                      <FileArchive />
                      Descargar KMZ
                    </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
    </div>
  );
}
