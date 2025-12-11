import type { Feature } from "geojson";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Hash, Map, Milestone, Square, DraftingCompass } from "lucide-react";

type ParcelDetailsProps = {
  feature: Feature;
};

const DetailItem = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: string | number | undefined | null }) => (
  <div className="flex items-start gap-4">
    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="text-base font-semibold break-all">{value || "No disponible"}</p>
    </div>
  </div>
);

export default function ParcelDetails({ feature }: ParcelDetailsProps) {
  const properties = feature.properties;
  if (!properties) return null;

  const formatArea = (area: number) => {
    if (area > 10000) {
      return `${(area / 10000).toLocaleString('es-CO', { maximumFractionDigits: 2 })} ha`;
    }
    return `${area.toLocaleString('es-CO', { maximumFractionDigits: 2 })} m²`;
  };

  const formatLength = (length: number) => {
    return `${length.toLocaleString('es-CO', { maximumFractionDigits: 2 })} m`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Detalles de la Parcela</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <DetailItem 
          icon={<Hash className="h-5 w-5" />} 
          label="Código Catastral" 
          value={properties.CODIGO} 
        />
        <Separator />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DetailItem 
              icon={<Map className="h-5 w-5" />} 
              label="Departamento" 
              value={properties.CODIGO_DEPARTAMENTO} 
            />
            <DetailItem 
              icon={<Milestone className="h-5 w-5" />} 
              label="Municipio" 
              value={properties.codigo_municipio} 
            />
            <DetailItem 
              icon={<Square className="h-5 w-5" />} 
              label="Área" 
              value={formatArea(properties.Shape__Area)} 
            />
            <DetailItem 
              icon={<DraftingCompass className="h-5 w-5" />} 
              label="Perímetro" 
              value={formatLength(properties.Shape__Length)} 
            />
        </div>
      </CardContent>
    </Card>
  );
}
