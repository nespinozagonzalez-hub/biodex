# BioDex 2.3 · FIELD-02

Remaster de la colección original: 30 bioformas, mismos códigos CAP, SEC y GYM,
capturas animadas, sectores, gimnasios, inventario, medallas y evoluciones.
Sin banco de preguntas ni reflexión obligatoria. El docente decide las actividades
de cualquier asignatura y entrega los códigos existentes.

## Estado de conexión

La aplicación está conectada al Apps Script del docente mediante `config.js`.
Al abrir, **Ingresar** pide el nombre y la clave de seis dígitos ya creados.
**Crear personaje** registra una cuenta nueva con su avatar y paisaje. Un diálogo
retro muestra la consulta mientras se recupera la colección. El acceso a la colección requiere una cuenta. No hay demo, captura local ni códigos de ejemplo.

Sitio principal: https://nespinozagonzalez-hub.github.io/biodex/
La URL anterior de vista previa continúa disponible con la misma versión conectada.
Las cuentas se crean dentro de la app; no se introducen PINs manualmente en Sheets.
Instrucciones del backend: [INSTALACION_SHEETS.md](backend/INSTALACION_SHEETS.md).

## Edición retro FIELD-02

Carcasa de dispositivo de campo, pantalla de exploración, controles A/B y
tarjeta de explorador presente en toda la interfaz. Cuatro avatares y cuatro
paisajes seleccionables al entrar o desde el perfil. Los 30 recortes PNG
transparentes se usan durante la captura y el escáner; la BioDex y las fichas
conservan las ilustraciones completas. La animación original permanece.

La bienvenida y el refugio muestran exclusivamente al entrenador ampliado sobre
el paisaje pixel art. En el refugio, el nombre del jugador protagoniza la pantalla.

La edición definitiva retira la exportación, importación y recuperación manual de
respaldos de la interfaz. La cuenta guarda y recupera el avance automáticamente.
Los datos locales de la edición anterior no se borran. La ruta antigua de Archivo
redirige al perfil; no puede importar ni sobrescribir la colección.

El escáner usa una señal genérica sin revelar una bioforma. Los gimnasios tienen
paisajes, emblemas, estados y filtros; las doce medallas muestran su progreso.
La mochila usa el mismo lenguaje de emblemas y describe el pasaporte de cuenta.

## Archivos

- `index.html`: colección, mecánicas originales, SVG de respaldo y animación de captura.
- `remaster.js`: acceso, validación remota, guardado confirmado e interfaz transversal.
- `remaster.css`: dirección visual bosque/pergamino/dorado, adaptación móvil.
- `retro.js` / `retro.css`: dispositivo FIELD-02, perfil, rutas de gimnasio y medallas.
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
simulan servicios de Apps Script y un DOM mínimo. El resultado de la prueba
contra el despliegue real se registra sin claves ni tokens en
[tests/LIVE_SHEETS_QA.json](tests/LIVE_SHEETS_QA.json).

La verificación visual usa instantáneas de los renderizadores reales, sin sesión
ni solicitudes de cuenta, dentro de marcos de 320, 390, 768 y 1280 px. No equivale
a una emulación de iOS o Android ni a una prueba de acceso en un dispositivo físico.
Ver [QA_FIELD.md](tests/QA_FIELD.md).

![Dispositivo FIELD-02](docs/field02-preview-20261015-01.jpg)

Para revisar el sitio: `python -m http.server 8000`, abrir `http://localhost:8000`.
