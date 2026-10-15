# BioDex 2.1 · FIELD-02

Remaster de la colección original: 30 bioformas, mismos códigos CAP, SEC y GYM,
capturas animadas, sectores, gimnasios, inventario, medallas y evoluciones.
Sin banco de preguntas ni reflexión obligatoria. El docente decide las actividades
de cualquier asignatura y entrega los códigos existentes.

## Estado de conexión

`config.js` contiene inicialmente un endpoint vacío. El sitio muestra una **vista
previa explícita**, sin cuentas ni guardado en Google Sheets. No presenta un
guardado local como si fuera un guardado en nube. Para habilitar las cuentas,
completa los pasos de [INSTALACION_SHEETS.md](backend/INSTALACION_SHEETS.md).

Vista previa aislada: https://nespinozagonzalez-hub.github.io/biodex/preview/
La edición original sigue en la raíz, sin cambios.

## Edición retro FIELD-02

Carcasa de dispositivo de campo, pantalla de exploración, controles A/B y
tarjeta de explorador presente en toda la interfaz. Cuatro avatares y cuatro
paisajes seleccionables al entrar o desde el perfil. Los 30 recortes PNG
transparentes se usan durante la captura y el escáner; la BioDex y las fichas
conservan las ilustraciones completas. La animación original permanece.

La demo permite probar los 47 códigos originales, con evoluciones en orden,
activación de siete territorios y diez gimnasios, logros y respaldo. Su progreso,
nombre, avatar, paisaje y textura CRT se guardan en una clave local separada
(`biodex_field_preview_v3`), sin PIN. No es progreso acreditado por el docente,
no es una cuenta real y no se sincroniza con otros equipos. Si el navegador
bloquea el almacenamiento persistente, se avisa y se conserva solo en sesión o
memoria. La colección de la edición anterior no se modifica.

## Archivos

- `index.html`: colección, mecánicas originales, SVG de respaldo y animación de captura.
- `remaster.js`: acceso, validación remota, guardado confirmado e interfaz transversal.
- `remaster.css`: dirección visual bosque/pergamino/dorado, adaptación móvil.
- `retro.js` / `retro.css`: dispositivo FIELD-02, perfil y laboratorio local.
- `assets/bioformas/`: ilustraciones optimizadas por bioforma.
- `assets/cutouts/`, `assets/avatars/`, `assets/landscapes/`: 38 recursos nuevos.
- `assets/FIELD_ART.md`: usos, direcciones de arte y prompts finales.
- `backend/Code.gs`: backend Apps Script vinculado a la hoja del docente.
- `tests/`: pruebas de reglas, backend con servicios simulados y navegador.

## Garantías del flujo

- La evolución requiere la etapa anterior en el servidor, no solo en la interfaz.
- Las activaciones se aplican sobre el progreso actual del servidor bajo bloqueo.
- Un navegador no puede sobrescribir la colección enviando un snapshot arbitrario.
- Cada captura se guarda **antes** de reproducir la animación.
- Un reintento devuelve el estado existente, sin duplicar capturas ni medallas.
- La clave de seis dígitos no se guarda en HTML, exportaciones ni texto plano en la hoja.
- Al salir se revoca la sesión; al restablecer una clave se revocan todas las sesiones.
- El progreso local antiguo se conserva; su migración requiere revisión docente.
- El remaster visual se carga después de los estilos heredados para evitar que la
  paleta antigua sobrescriba el diseño nuevo. `retro.css` se carga al final.
- Si el navegador bloquea sessionStorage (por ejemplo en ciertos iframes), la
  sesión puede funcionar en memoria: una captura confirmada no deja de mostrarse
  por ese bloqueo. Se avisa que habrá que ingresar otra vez al recargar.
- Avatar y paisaje se validan con listas permitidas al registrar o cambiar
  preferencias; no permiten enviar capturas arbitrarias ni sobrescribir progreso.

## Alcance de seguridad

Es un sistema educativo de bajo riesgo, no un servicio para datos sensibles.
Nombre y PIN de seis dígitos tienen una fortaleza limitada. El backend utiliza
HMAC con sal y secreto del servidor, límite de intentos y sesiones temporales.
La hoja debe ser privada. No usar RUT, notas, información de salud ni otros datos
sensibles. Los códigos antiguos ya existen en el historial público del repositorio;
preservarlos no equivale a convertirlos en secretos antifraude. El docente controla
su distribución, pero no se ofrece protección de evaluación de alto impacto.

El backend valida los códigos originales; no incorpora un calendario nuevo de
liberación ni crea códigos nuevos. Conservar la URL existente permite que los
iframes sigan apuntando al mismo sitio.

## Pruebas locales

Ejecutar `node --test tests/*.test.cjs`. Las pruebas
simulan servicios de Apps Script y un DOM mínimo; **no sustituyen** una prueba
real del despliegue de Google ni la revisión visual en un navegador.

`node tests/ui-smoke.cjs` prepara la revisión de navegador a 1440, 390 y 320 px.
Requiere Playwright y su navegador Chromium instalado. En el entorno de creación
no se pudo ejecutar esta última revisión porque Chromium no estaba disponible y
su descarga no se completó. La verificación visual sigue pendiente.

Para revisar el sitio: `python -m http.server 8000`, abrir `http://localhost:8000`.
