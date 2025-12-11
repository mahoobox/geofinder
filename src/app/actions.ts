"use server";

import type { FeatureCollection } from "geojson";

export async function getParcelData(lat: number, lon: number): Promise<{ data?: FeatureCollection; error?: string }> {
  const baseUrl = process.env.BASE_URL_ARGIS_CATASTRAL;
  const apiKey = process.env.API_KEY_CATASTRAL; // Reserved for future use if API requires a key

  if (!baseUrl) {
    return { error: "La URL base del servicio de catastro no está configurada en el servidor." };
  }

  // The query is constructed for the ArcGIS REST API
  const queryParams = new URLSearchParams({
    where: "1=1",
    outFields: "*",
    geometry: `${lon},${lat}`,
    geometryType: "esriGeometryPoint",
    inSR: "4326", // WGS84 standard for lat/lon
    spatialRel: "esriSpatialRelIntersects",
    returnGeometry: "true",
    outSR: "4326", // Request geometry in WGS84
    f: "geojson", // Request format
  });

  // Append layer and query endpoint. Assuming layer 0.
  const fullUrl = `${baseUrl}/0/query?${queryParams.toString()}`;

  try {
    const response = await fetch(fullUrl, {
        headers: {
            // Example of how an API key might be used in the future
            // ...(apiKey && { 'Authorization': `Bearer ${apiKey}` })
        }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error from ArcGIS service:", errorText);
      return { error: `Error del servicio de catastro: ${response.statusText}` };
    }

    const data: FeatureCollection = await response.json();
    
    if (!data.features || data.features.length === 0) {
        return { error: "No se encontraron parcelas en las coordenadas proporcionadas." };
    }

    return { data };
  } catch (error) {
    console.error("Failed to fetch parcel data:", error);
    if (error instanceof Error) {
        return { error: `Error de red o de servidor: ${error.message}` };
    }
    return { error: "Ocurrió un error desconocido durante la consulta." };
  }
}
