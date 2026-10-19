# BioDex 2.7.1 · Consola adaptable

Estado: retirada de la aplicación principal en 2.6.2 por el fallo de teclado observado en iPhone. Este documento describe el prototipo, conservado para una revisión futura. La aplicación principal vuelve al diseño 2.6.1 y al desplazamiento normal.

- [x] Marco, menú y controles A/B permanentes; desplazamiento vertical interior.
- [x] Altura de la consola ajustada al viewport visible y a sus cambios al girar el dispositivo.
- [x] Márgenes seguros para pantallas con recorte.
- [x] Botón Ampliar con Fullscreen API cuando está disponible y modo ajustado cuando no lo está. La alternativa no promete ocultar las barras del navegador.
- [x] Botón Ajustar: reduce toda la consola manteniendo su proporción y aprovecha el ancho disponible.
- [x] Selector de 1, 2 o 3 bioformas por fila, también en teléfono; preferencia visual local independiente.
- [x] Filtros originales agrupados en Buscar y filtrar para dejar espacio a las miniaturas.
- [x] Ficha original accesible desde cada tarjeta compacta.
- [x] Captura existente a pantalla visible completa, fuera de la escala y del desplazamiento interior; distribución horizontal con ilustración y controles lado a lado.
- [x] Perfil accesible aunque el menú compacto oculte la tarjeta de entrenador.
- [x] Demo independiente actualizada y botón para probar la animación sin usar códigos reales.
- [x] Acceso original preservado: la capa de consola solo se activa después de mostrar el dispositivo.
- [x] Edición en teléfono/tablet: el formulario usa el espacio disponible y aparta temporalmente el menú. El botón Listo restaura el marco sin borrar el texto ni la preferencia de escala.
- [x] Rotación y desplazamiento del viewport con teclado: el campo activo permanece visible y con texto de 16 px, sin escalar.
- [x] El envío cierra el modo de edición después de que se dispara el formulario original.
- [x] Miniaturas acotadas por el alto real del panel, incluida la consola reducida; la vista de una columna aprovecha el ancho para poner la ficha junto a la imagen.

## Alcance

Se añaden `console.js` y `console.css`; `index.html` y su copia preview únicamente cargan el script nuevo al final. No cambian los bloques de JavaScript existentes del HTML, `config.js`, `remaster.js`, `retro.js`, `megas.js`, `territorios.js`, `narrativa.js`, `experiencia.js` ni Apps Script. No cambian los códigos, las cuentas, las reglas de desbloqueo o la confirmación remota previa a la captura.

La captura ocupa el espacio del sitio que deja disponible el navegador; las barras de Safari pueden permanecer visibles. Las pruebas usan Chromium con distintos tamaños; la revisión física de iPhone corresponde a la siguiente comprobación del usuario.

## Verificación

- `node --test tests/*.test.cjs`: 56 pruebas existentes aprobadas.
- `tests/experiencia.browser.cjs`: 18 comprobaciones aprobadas, incluidos sonido MP3, capturas tras confirmación, duplicados, fallos de red, seis rarezas, ajustes y ausencia de escrituras desde las mejoras estéticas.
- `tests/console.browser.cjs`: 150 combinaciones de sección/tamaño en 15 tamaños; selector de columnas a cuatro tamaños; 20 capturas en cuatro tamaños; miniaturas dentro de sus tarjetas; modo ajustado, captura fuera de la escala, alternativa sin Fullscreen API y acceso normal de producción. Sin peticiones reales a Apps Script.
- `tests/console-input.browser.cjs`: 8 casos de teclado con alturas y desplazamientos simulados en vertical/horizontal y ambas escalas; giro mientras se escribe; filtros originales; envío del código; 12 combinaciones de tarjetas/escala; acceso y captura con el frontend de producción y respuestas del servidor simuladas. No usa cuentas reales. Estas pruebas emulan el viewport del teclado; no son una certificación en un iPhone físico.
