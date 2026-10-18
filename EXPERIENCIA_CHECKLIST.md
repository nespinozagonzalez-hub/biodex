# BioDex · Pulido de experiencia 2.5

Capa exclusivamente audiovisual. Base: `1a83318` (2.4.2).

## Trabajo

- [x] 01. Efectos originales de interfaz, escáner y recompensas.
- [x] 02. Tres ambientes musicales originales y transiciones suaves.
- [x] 03. Controles independientes, silencio y preferencias locales.
- [x] 04. Capturas con presentación diferenciada por rareza y salida rápida.
- [x] 05. Celebraciones visuales de territorios y gimnasios confirmados.
- [x] 06. Legibilidad y áreas táctiles ampliadas en móvil.
- [x] 07. Escáner con estado visual durante la validación.
- [x] 08. Ambientación discreta según paisaje y movimiento reducido.
- [x] 09. Movimiento suave de la criatura en su ficha.
- [x] 10. Linajes conectados y sello de colección completa.
- [x] 11. Celebración de medallas nuevas y linajes completos.
- [x] 12. Visor ampliado para ilustraciones capturadas.
- [x] 13. Prólogo ilustrado, omitible y siempre consultable.
- [x] 14. Botones, luces y transiciones del dispositivo.

## Límites

- Sin modificaciones a `backend/`, `config.js`, `remaster.js`, `retro.js`,
  `megas.js`, `territorios.js` ni `narrativa.js`.
- El HTML solo incorpora una hoja de estilo y un script al final de sus capas.
- No cambian códigos, reglas, funciones centrales, atributos ni estructura de progreso.
- La capa observa el DOM y lee el estado existente: no llama a la API, no guarda
  progreso ni añade campos a Sheets. Las preferencias audiovisuales son locales.
- Las celebraciones no conceden recompensas. Solo presentan cambios ya confirmados.
- La música permanece fuera de `#app`, y continúa al cambiar de pantalla.
- El sonido empieza desactivado. La activación requiere un gesto del jugador.
- Sin servicios externos de música. Once MP3 propios, menos de 1 MB, cargados al
  reproducir; la página no descarga audio antes de la activación.
- Sitio principal y `/preview/` reciben los mismos archivos.

## Verificación

- [x] Pruebas existentes de frontend, backend, narrativa, territorios y recursos.
- [x] Pruebas de navegador con servidor simulado, sin cuentas reales.
- [x] Comprobar cero cambios al backend, configuración y lógica central.
- [x] Comprobar navegación, volumen, persistencia local y pausa en segundo plano.
- [x] Comprobar captura, duplicados, errores y celebraciones tras confirmación.
- [x] Revisar 320, 390, 768 y 1280 px, visor y prólogo.
- [x] Verificar respeto a movimiento reducido y fallos de audio/almacenamiento.

## Corrección de audio 2.5.2

- [x] Reproducción MP3 mediante HTMLAudio, independiente de Web Audio.
- [x] Activación directa, prueba audible y recuperación de bloqueos.
- [x] Sesión de reproducción multimedia cuando el navegador la ofrece.
- [x] 18 comprobaciones de navegador; 56 pruebas originales conservadas.
