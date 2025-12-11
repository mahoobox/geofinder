"use server";

import type { FeatureCollection } from "geojson";

export async function getParcelData(lat: number, lon: number): Promise<{ data?: FeatureCollection; error?: string }> {
  const baseUrl = process.env.BASE_URL_ARGIS_CATASTRAL;
  const apiKey = process.env.API_KEY_CATASTRAL; 

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
    distance: "10",
    units: "esriSRUnit_Meter",
    returnGeometry: "true",
    outSR: "4326", // Request geometry in WGS84
    f: "geojson", // Request format
    resultRecordCount: "1",
  });

  // Append layer and query endpoint. Correct layer is 14.
  const fullUrl = `${baseUrl}/14/query?${queryParams.toString()}`;
  
  console.log("Consultando URL:", fullUrl);

  try {
    const fetchOptions: RequestInit = {
        headers: {}
    };

    if (apiKey) {
      // ArcGIS can use tokens in different ways. A common way is via an 'Authorization' header.
      // Another is a `token` query parameter. Adjust if the service requires a different method.
      (fetchOptions.headers as HeadersInit)['Authorization'] = `Bearer ${apiKey}`;
    }

    const response = await fetch(fullUrl, fetchOptions);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error from ArcGIS service:", errorText);
      return { error: `Error del servicio de catastro: ${response.statusText}` };
    }

    const data: FeatureCollection = await response.json();
    
    console.log("Respuesta de la API:", JSON.stringify(data, null, 2));

    if (!data.features || data.features.length === 0) {
        return { error: "No se encontraron parcelas en las coordenadas proporcionadas." };
    }

    return { data };
  } catch (error) {
    console.error("Error en la acción del servidor:", error);
    if (error instanceof Error) {
        return { error: `Error de red o de servidor: ${error.message}` };
    }
    return { error: "Ocurrió un error desconocido durante la consulta." };
  }
}
