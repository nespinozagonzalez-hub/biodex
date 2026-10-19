# Restauración para uso en aula

Se retira la carga de `console.js` de `index.html` y `preview/index.html`. Por tanto, `console.css`, la escala, el marco de alto fijo, el modo de edición y los controladores de visualViewport dejan de ejecutarse en producción. Los estilos y scripts de 2.6.1 permanecen idénticos a `17918de886e2e95c7a987eed74a48deb0c2c96b5`.

Se añade un control de pantalla completa independiente, colocado en el flujo normal antes de la aplicación. Usa la API nativa y permite salir. Si el navegador no la admite o rechaza la solicitud, abre una ayuda; no cambia el tamaño de la consola ni interviene en el teclado. Las etiquetas para abrir como app desde la pantalla de inicio completan esta alternativa en iPhone. No se añade guardado local, service worker ni modo sin conexión.

La lógica original del HTML, cuentas, endpoint, Apps Script, códigos, progreso, audio y recursos se conserva. La consola experimental sigue en su ruta de demostración para revisión posterior; no se usa en el enlace principal.

Verificación: pruebas originales, revisión del diseño 2.6, comprobaciones audiovisuales y prueba de pantalla completa/alternativa con escritura y giro. No se usan cuentas reales. Las pruebas de navegador son emuladas y no sustituyen la comprobación física del iPhone del docente.
