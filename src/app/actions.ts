"use server";

import type { FeatureCollection } from "geojson";

export async function getParcelData(lat: number, lon: number): Promise<{ data?: FeatureCollection; error?: string }> {
  const baseUrl = process.env.BASE_URL_ARGIS_CATASTRAL;
  const apiKey = process.env.API_KEY_CATASTRAL; 

  console.log("Iniciando getParcelData...");
  console.log("Latitud:", lat, "Longitud:", lon);
  console.log("BASE_URL_ARGIS_CATASTRAL:", baseUrl ? "Encontrada" : "No encontrada");
  console.log("API_KEY_CATASTRAL:", apiKey ? "Encontrada" : "No encontrada");

  if (!baseUrl) {
    console.error("Error: La URL base no está configurada.");
    return { error: "La URL base del servicio de catastro no está configurada en el servidor." };
  }

  // The query is constructed for the ArcGIS REST API
  const queryParams = new URLSearchParams({
    where: "1=1", // This is often used to get all features that intersect
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
  console.log("URL completa de la consulta:", fullUrl);

  try {
    const fetchOptions: RequestInit = {
        headers: {}
    };

    if (apiKey) {
      // ArcGIS can use tokens in different ways. A common way is via an 'Authorization' header.
      // Another is a `token` query parameter. Adjust if the service requires a different method.
      // For this service, it seems a token is not required for public access, but we prepare for it.
      // (fetchOptions.headers as HeadersInit)['Authorization'] = `Bearer ${apiKey}`;
    }

    const response = await fetch(fullUrl, fetchOptions);
    console.log("Respuesta del servicio - Status:", response.status, response.statusText);


    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error from ArcGIS service:", errorText);
      return { error: `Error del servicio de catastro: ${response.statusText}` };
    }

    const data: FeatureCollection = await response.json();
    console.log("Datos recibidos:", data);
    
    if (!data.features || data.features.length === 0) {
        console.warn("La consulta fue exitosa pero no se encontraron parcelas.");
        return { error: "No se encontraron parcelas en las coordenadas proporcionadas." };
    }

    console.log(`Se encontraron ${data.features.length} features.`);
    return { data };
  } catch (error) {
    console.error("Fallo al consultar los datos de la parcela:", error);
    if (error instanceof Error) {
        return { error: `Error de red o de servidor: ${error.message}` };
    }
    return { error: "Ocurrió un error desconocido durante la consulta." };
  }
}
