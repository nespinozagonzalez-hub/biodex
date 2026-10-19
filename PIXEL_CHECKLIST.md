# BioDex 2.6 · Identidad pixel art y adaptación de pantalla

Base protegida: `0839b11c073cb683345b1ac55c9559f832c9725f`.

## Checklist

- [x] 01. Favicon propio del lente FIELD-02, SVG y PNG.
- [x] 02. Cuatro fondos panorámicos originales para rodear el dispositivo.
- [x] 03. Paletas del bosque, lago, bruma y cumbres según la elección existente.
- [x] 04. Profundidad ambiental suave, con movimiento reducido y versión táctil.
- [x] 05. Marcos y ventanas con un acabado coherente de RPG de 16 bits.
- [x] 06. Carcasa con tornillos, lente, ranuras y luces pixeladas.
- [x] 07. Botones con relieve, estados visibles y áreas táctiles cómodas.
- [x] 08. Tipografía pixel local en títulos; lectura cómoda en relatos y campos.
- [x] 09. Iconos pixel propios y consistentes en la navegación.
- [x] 10. Fichas como registros del dispositivo, con arte y rareza originales.
- [x] 11. Luces, partículas cuadradas y diálogos con lenguaje de RPG.
- [x] 12. Ajuste a móvil, tablet, escritorio, horizontal y pantallas amplias.

## Límites del cambio

Solo archivos nuevos de presentación, recursos y etiquetas de carga del HTML.
No se modifican scripts existentes, configuración, backend, códigos, atributos,
progreso, cuentas, sesiones, preferencias ni comportamiento de navegación.
`pixel.js` únicamente decora nodos de interfaz y variables CSS. No llama a la API,
no guarda datos y no reemplaza funciones del juego.

El contenido conserva desplazamiento vertical natural: no se escala toda la
interfaz ni se fija una altura que recorte formularios o fichas. Los controles
siguen disponibles con ratón, teclado y pantalla táctil.

## Validación

- [x] Integridad de backend, configuración y todos los scripts existentes.
- [x] Pruebas originales de reglas y de presentación.
- [x] Flujo de audio, acceso y capturas con backend simulado.
- [x] Revisión visual y de desbordamiento en anchos de 320 a 2560 px.
- [x] Teléfono horizontal, vista estrecha incrustada y zoom de texto.
- [x] Navegación y formularios accesibles sin eliminar controles.
- [x] Principal y preview equivalentes; publicación verificada.

[Dirección de arte, recursos y prompts](assets/pixel/ART_DIRECTION.md).
[Informe de verificación](tests/QA_PIXEL_2_6.md).
