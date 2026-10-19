# BioDex 2.6 · Verificación estética y adaptable

Base: `0839b11c073cb683345b1ac55c9559f832c9725f`.

## Resultado

- 56 pruebas originales aprobadas.
- 18 comprobaciones existentes de navegador aprobadas, con audio MP3,
  autenticación y capturas frente a respuestas de Apps Script simuladas.
- 214 comprobaciones adicionales de distribución, sin desbordamientos horizontales,
  controles fuera de la pantalla ni paneles con desbordamiento interno.
- 16 tamaños, con anchos de 320 a 2560 px y teléfonos en horizontal.
- Cero errores JavaScript y cero solicitudes a Sheets desde la prueba de diseño.
- Título y entrenador de bienvenida sin superposición en los 16 tamaños.
- Nombres largos, acceso, registro, diez secciones del juego, fichas, ajustes y
  las tres escenas de historia revisados con los renderizadores reales.
- Iconos nuevos conservan los nueve manejadores originales de navegación.
- La decoración y el paralaje no modifican progreso, sesión ni capacidades.
- Los cuatro paisajes existentes seleccionan sus nuevos fondos por CSS.
- Fuente local cargada; favicon SVG/PNG; preview equivalente.
- Movimiento reducido desactiva el paralaje; en táctil no se activa.
- Formulario comprobado con emulación táctil y campos de 16 px.
- Texto narrativo ampliado al 140 % sin desbordar la sección de guía.
- Márgenes CSS para las áreas seguras del dispositivo, altura dinámica de los
  diálogos y desplazamiento vertical natural de los formularios.

## Tamaños revisados

| Vertical / escritorio | Horizontal |
| --- | --- |
| 320 × 568 | 568 × 320 |
| 360 × 640 | 667 × 375 |
| 390 × 844 | 844 × 390 |
| 430 × 932 | 1024 × 600 |
| 600 × 800 | |
| 768 × 1024 | |
| 820 × 1180 | |
| 1024 × 768 | |
| 1280 × 800 | |
| 1440 × 900 | |
| 1920 × 1080 | |
| 2560 × 1440 | |

Estas comprobaciones usan Chromium 153 en Linux y emulación táctil; no certifican
hardware físico iOS/Android ni todas las configuraciones de muesca o navegador.
No se crearon usuarios ni se modificaron datos en la hoja real.

## Integridad

La comparación con la base mantiene idénticos `backend/`, `config.js`, todos los
scripts existentes (incluido `experiencia.js` y su audio), los CSS previos y los
bloques JavaScript inline del HTML. Solo se incorporan etiquetas de presentación,
recursos y las capas independientes `pixel.css` / `pixel.js`.

```bash
node --test tests/*.test.cjs
node tests/experiencia.browser.cjs
node tests/pixel.browser.cjs
```

La última prueba inicia su propio servidor local, bloquea las solicitudes a
Apps Script y acepta `BIODEX_BROWSER_EXECUTABLE` y `BIODEX_PIXEL_QA`.
