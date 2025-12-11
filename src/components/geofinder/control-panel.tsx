"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { FeatureCollection } from "geojson";
import {
  ClipboardCopy,
  Download,
  Loader2,
  Search,
  Trash2,
  View,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
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

const formSchema = z.object({
  lat: z
    .number({ invalid_type_error: "Debe ser un número" })
    .min(-90, "Debe ser mayor que -90")
    .max(90, "Debe ser menor que 90"),
  lng: z
    .number({ invalid_type_error: "Debe ser un número" })
    .min(-180, "Debe ser mayor que -180")
    .max(180, "Debe ser menor que 180"),
});

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
  geoJson,
  isLoading,
  onQuery,
  onClear,
}: ControlPanelProps) {
  const [isGeoJsonDialogOpen, setIsGeoJsonDialogOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      lat: undefined,
      lng: undefined,
    },
  });

  useEffect(() => {
    if (coordinates) {
      form.setValue("lat", parseFloat(coordinates.lat.toFixed(6)));
      form.setValue("lng", parseFloat(coordinates.lng.toFixed(6)));
      form.clearErrors();
    } else {
      form.reset({ lat: undefined, lng: undefined });
    }
  }, [coordinates, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    onQuery(values);
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

  return (
    <div className="bg-card text-card-foreground border-r overflow-y-auto">
      <ScrollArea className="h-full">
        <div className="p-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Entrada de Coordenadas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4 text-sm">
                Ingrese coordenadas (WGS84) o seleccione un punto en el mapa.
              </p>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="lat"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Latitud</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="any"
                              placeholder="-34.6037"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lng"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Longitud</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="any"
                              placeholder="-58.3816"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
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
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Datos de la Parcela</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">La consulta fue exitosa. Puede ver o descargar los datos del polígono.</p>
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
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
