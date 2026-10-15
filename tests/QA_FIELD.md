# Verificación de FIELD-02

Fecha: 2026-10-15. Aplicación pública probada:
https://nespinozagonzalez-hub.github.io/biodex/preview/

## Pruebas automatizadas

`node --test tests/*.test.cjs`: 31 pruebas aprobadas. Incluyen backend con
servicios simulados, 47 códigos intactos, cadenas evolutivas, idempotencia,
recuperación, personalización, separación del progreso antiguo y recursos.

34 PNG se decodificaron adicionalmente: todos tienen píxeles realmente
transparentes y píxeles opacos; no son fondos dibujados como un damero.

## Distribución en navegador real

La página `viewport.html` carga la aplicación real dentro de un iframe de ancho
seleccionable. Se comprobaron Refugio, BioDex, Capturar, Territorios, Gimnasios,
Evoluciones, Mochila, Logros, Archivo, Guía y Perfil en cada tamaño.

| Marco | Área útil con barra de desplazamiento | Pantallas | Controles fuera del ancho |
| --- | --- | --- | --- |
| 320 px | 305 px | 11 | 0 |
| 390 px | 375 px | 11 | 0 |
| 768 px | 753 px | 11 | 0 |
| 1280 px | 1265 px | 11 | 0 |

En las 44 comprobaciones, el ancho desplazable coincide con el área útil y los
botones, campos, selectores y áreas de texto no salen de los bordes. Es una
prueba de distribución adaptable, no una emulación de Android/iOS o de gestos.

## Interacciones comprobadas en la vista publicada

- Elegir Prisma y Estación Bruma en la bienvenida actualiza avatar, selección y paisaje.
- Cambiar a Terra y Cumbres Arcana desde Perfil actualiza toda la interfaz.
- `CAP-PRISMARA-337` sin Auralis muestra el bloqueo y no consume el código.
- `SEC-AURORA-001` activa el territorio local sin cuestionario.
- `GYM-AURORA-001` activa el gimnasio local sin cuestionario.
- Recargar y continuar recupera avatar, paisaje, capturas y ambas activaciones.
- `CAP-AURALIS-216` tras Nimbel reproduce la animación original con `cutouts/B002.png`.
- Al cerrar la animación, la ficha utiliza `bioformas/B002.webp`, con estadísticas y sin preguntas.
- La BioDex muestra 30 tarjetas, el avatar escogido y el arte completo de las capturadas.
- URLs versionadas de los cinco recursos de ejecución evitan reutilizar el JavaScript antiguo.

Captura de la interfaz: [FIELD-02](../docs/field02-preview-20261015-01.jpg).

## Integración aplazada

El endpoint de Apps Script permanece vacío por petición del usuario. No se
crearon hojas ni cuentas reales ni se probó la sincronización real entre equipos.
La demo no comprueba ni guarda el PIN y no acredita progreso del docente.

La publicación modifica solo `/preview/`. Se comprobó que el `index.html`
original mantiene el blob `41ee788123e38e302b08fb457726b48ebec25893`.

## Actualización: identidad del entrenador

Se retiraron las bioformas de bienvenida y refugio, ampliando al entrenador y
destacando el nombre del jugador. Verificadas ambas pantallas a 320, 390, 768 y
1280 px: ocho comprobaciones sin controles recortados ni imágenes de bioformas
en los paisajes. El avatar mide entre 260 y 350 px de alto según pantalla y ancho.
Las 31 pruebas automatizadas siguen aprobadas.

Vista de la [portada con entrenador](../docs/field02-trainer-welcome.jpg).


## Conexión 2.2 · 2026-10-15

El endpoint del docente se incorpora en `config.js`. La raíz principal se publica
con FIELD-02; la versión original permanece recuperable en el historial.
La vista previa también recibe la conexión y el mismo formulario actualizado.

- 34 pruebas automatizadas aprobadas (backend simulado, recursos y frontend).
- Pruebas nuevas: espera durante el ingreso, error de clave y sesión vencida.
- El diálogo usa `<dialog>` nativo, no se cancela con Escape y respeta movimiento reducido.
- Se limpia el PIN del formulario al enviar; no se guarda en el navegador.
- La espera prolongada se comunica sin inventar un porcentaje completado.
- La demo queda plegada, separada del acceso real.
- El reporte de prueba real está en `LIVE_SHEETS_QA.json`, sin PIN ni tokens.

La prueba real usa una cuenta sintética identificada con el prefijo «QA BioDex».
Comprueba sesiones independientes mediante solicitudes HTTP al despliegue de
Google; no equivale a una prueba de login manual en dos dispositivos físicos.
La revisión visual del formulario conectado se realiza por separado en navegador.
