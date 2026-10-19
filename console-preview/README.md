# Propuesta de consola adaptable · vista previa aislada

Ruta: `/console-preview/`. No se carga desde la aplicación habitual.

- Marco completo ajustado al alto y ancho disponibles; navegación y botones A/B permanentes.
- Contenido largo con desplazamiento vertical dentro de la pantalla.
- Distribución específica horizontal/vertical y sugerencia de girar que se puede cerrar.
- Controles de sonido e historia en la franja superior de la demo.
- En una pantalla horizontal muy baja, también el refugio requiere desplazamiento interior para conservar la legibilidad.
- Personaje y colección ficticios. No hay acceso a cuentas, lectura de sesión real ni conexión a Google Sheets. Todas las preferencias de la demo usan un prefijo de almacenamiento independiente.
- La página reutiliza los renderizadores y recursos actuales. No se han modificado los archivos de producción. `index.html` es una copia de revisión con recursos relativos a la raíz y capas exclusivas de esta demo.

Validación: `tests/console-preview.browser.cjs`, Chromium, 120 combinaciones de vista y tamaño entre 320×568 y 2560×1440. Comprueba marco visible, navegación accesible, áreas táctiles, ausencia de desbordamientos, desplazamiento interno y cero peticiones a Apps Script. Prueba por emulación; pendiente revisión en el dispositivo del usuario antes de aplicar a producción.
