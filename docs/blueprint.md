# **App Name**: GeoFinder

## Core Features:

- Entrada de Coordenadas: Permite a los usuarios ingresar coordenadas (latitud y longitud) manualmente en formato WGS84.
- Selección en el Mapa: Permite a los usuarios seleccionar una ubicación en el mapa de OpenStreetMap para extraer las coordenadas.
- Consulta Geoespacial: Obtiene los datos del polígono de la parcela en formato GeoJSON del servicio catastral utilizando las coordenadas proporcionadas. La solicitud se envía al endpoint https://services2.arcgis.com/RVvWzU3lgJISqdke/ArcGIS/rest/services/CATASTRO_PUBLICO_Junio_30_2024/FeatureServer
- Visualización de Polígono: Muestra el polígono de la parcela obtenido en el mapa de OpenStreetMap.
- Visualización y Copia de GeoJSON: Presenta los datos GeoJSON sin procesar de la parcela en una ventana emergente, permitiendo a los usuarios copiar los datos.
- Descarga de Archivos: Proporciona botones para descargar los datos del polígono de la parcela en formatos KML y KMZ.
- Herramienta de Variables de Entorno: Esta función, cuando se le solicita, utiliza una herramienta que verifica las variables de entorno necesarias, como BASE_URL_ARGIS_CATASTRAL y API_KEY_CATASTRAL, haciendo una referencia cruzada con el estado actual para identificar, alertar y usar las configuraciones de entorno en la aplicación.

## Style Guidelines:

- Color primario: Marrón terroso (#A67B5B), que evoca estabilidad y profesionalismo.
- Color de fondo: Beige desaturado (#F2E7D5), que proporciona un telón de fondo cálido y neutral.
- Color de acento: Naranja apagado (#D9A373), utilizado para elementos interactivos y resaltados.
- Fuente del cuerpo y del encabezado: 'Poppins' (sans-serif) para una apariencia moderna y elegante.
- Utilice iconos simples y limpios para representar acciones y tipos de datos.
- Mantenga un diseño limpio y bien espaciado con el mapa como protagonista.
- Incorpore animaciones sutiles para interacciones como el zoom del mapa y la carga de datos.