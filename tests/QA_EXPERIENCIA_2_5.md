# BioDex 2.5 · Verificación de presentación

Base revisada: `1a83318c322f7d0167a2396bc5fabd9c13495843`.
Fecha: 18 de octubre de 2026 UTC / 17 de octubre en Chile.

## Alcance y aislamiento

- 56 pruebas existentes aprobadas (`node --test tests/*.test.cjs`).
- 17 comprobaciones de navegador aprobadas, incluyendo 40 pantallas adaptables.
- Chromium 153 en Linux, con audio Web Audio real y medición de señal no nula.
- Todas las llamadas a Apps Script fueron interceptadas y respondidas por un
  servidor simulado. No se crearon cuentas ni capturas en la hoja real.
- Audio, volúmenes, movimiento, prólogo y visor mantienen exactamente iguales el
  progreso, la sesión y las características de servidor. No producen peticiones.
- Cero errores JavaScript de página y cero escrituras remotas desde la capa nueva.
- Código repetido, error de validación y fallo de red no celebran capturas nuevas.
- Se verifica pausa/reanudación mediante el evento de visibilidad simulado.
- Preferencias locales sobreviven a recarga; el audio espera un nuevo gesto.
- Sin Web Audio o con almacenamiento bloqueado, la interfaz sigue disponible.

## Presentación

Refugio, BioDex, Capturar, Territorios, Gimnasios, Linajes, Mochila, Logros,
Guía y Perfil: sin desbordamientos horizontales ni controles fuera del ancho a
320, 390, 768 y 1280 px. Se revisaron capturas de refugio, ajustes, prólogo,
colección, linajes, ficha y revelación de los seis grados de rareza. Movimiento reducido respeta
la preferencia del sistema y el control local.

Son pruebas de navegador y distribución adaptable; no certifican dispositivos
físicos iOS/Android ni la reproducción en sus altavoces. No se modificó ni volvió
a desplegar el backend real.

## Integridad

La comparación con la base confirma que `backend/`, `config.js`, `remaster.js`,
`retro.js`, `megas.js`, `territorios.js` y `narrativa.js` son idénticos. Todos los
scripts inline de `index.html` son idénticos; solo se agregaron dos etiquetas de
carga. Principal y preview tienen el mismo HTML y las mismas capas nuevas.

## Repetir la comprobación

Con Node.js, Playwright y un Chromium disponible:

```bash
node --test tests/*.test.cjs
node tests/experiencia.browser.cjs
```

El test inicia su servidor HTTP local. Opcionalmente se pueden definir
`BIODEX_BROWSER_EXECUTABLE`, `BIODEX_QA_DIR` o `BIODEX_TEST_URL`. Si se indica
una URL externa, usar exclusivamente una copia de prueba: las llamadas a Apps
Script siguen interceptadas, pero otras fuentes externas del sitio podrían cargarse.
Los resultados no contienen claves de usuario ni tokens.
