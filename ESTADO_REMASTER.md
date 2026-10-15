# Estado de BioDex 2.2 · FIELD-02

## Actualizaciones retro

- [x] Carcasa de dispositivo de captura, pantalla de campo y controles A/B.
- [x] Cuatro avatares seleccionables al inicio y desde el perfil.
- [x] Avatar y nombre del explorador presentes durante toda la BioDex.
- [x] Cuatro paisajes: Bosque Aurora, Lago Prisma, Estación Bruma y Cumbres Arcana.
- [x] Paisaje aplicado al inicio, refugio y entorno del dispositivo.
- [x] 30 PNG con transparencia real para captura, siluetas y pantallas de campo.
- [x] 30 ilustraciones completas conservadas para colección y fichas.
- [x] Laboratorio local para probar todos los códigos, sin fingir guardado en nube.
- [x] Nombre, capturas, activaciones, avatar, paisaje y CRT persistentes en la demo.
- [x] La demo no guarda el PIN ni modifica el progreso de la edición anterior.
- [x] Backend preparado para guardar y recuperar avatar/paisaje con validación.
- [x] 34 PNG inspeccionados y verificados con píxeles transparentes reales.
- [x] 44 comprobaciones en navegador de once pantallas a 320, 390, 768 y 1280 px.
- [x] Captura PNG → ficha WebP, bloqueo evolutivo y recuperación local probados en vivo.
- [x] Publicación previa aislada verificada antes de activar las cuentas.

## Implementado

- [x] Flujo transversal, sin preguntas ni reflexión obligatoria.
- [x] Acceso y registro con nombre único y clave de seis dígitos.
- [x] Clave protegida con HMAC, sal y secreto privado del servidor.
- [x] Límite de intentos, sesiones de ocho horas y cierre de sesión.
- [x] Backend Apps Script para hoja privada del docente.
- [x] Recuperación de capturas, sectores, gimnasios, logros y configuración.
- [x] Guardado de cada activación antes de confirmar el resultado en la interfaz.
- [x] Evoluciones condicionadas a su etapa anterior en el servidor.
- [x] Códigos repetidos sin capturas duplicadas.
- [x] 47 códigos originales conservados: 30 CAP, 7 SEC y 10 GYM.
- [x] Animación original de captura conservada, con nuevas ilustraciones.
- [x] Mapa, gimnasios, inventario, fichas, filtros y medallas conservados.
- [x] Dirección estética bosque profundo, dorado y diario de expedición.
- [x] Estilos adaptables, foco de formularios y movimiento reducido.
- [x] Respaldo antiguo local intacto; migración con revisión docente.
- [x] Instrucciones de instalación y recuperación de acceso.
- [x] 34 pruebas automatizadas de lógica, flujo, integración y recursos pasan con servicios simulados.
- [x] Colección completa de 30 ilustraciones propias, optimizadas en WebP.
- [x] Orden de estilos corregido: el diseño nuevo prevalece sobre el antiguo.
- [x] Capturas y vista previa operativas aunque el navegador bloquee el almacenamiento.

## Conexión y publicación 2.2

- [x] URL `/exec` entregada por el docente y respuesta de salud comprobada.
- [x] Endpoint incorporado en `config.js`.
- [x] Ingreso principal con nombre y clave de seis dígitos.
- [x] Registro de personaje con avatar y paisaje.
- [x] Ventana de espera al registrar, ingresar, recargar o actualizar la colección.
- [x] Mensaje de espera prolongada y recuperación de errores sin acreditar cambios.
- [x] La clave se limpia del formulario al enviar y no se persiste localmente.
- [x] Demo separada bajo «Probar el dispositivo sin cuenta».
- [x] Tres pruebas nuevas de acceso, espera, errores y sesión vencida.

La prueba real del backend se documenta en `tests/LIVE_SHEETS_QA.json`.
La edición original sigue recuperable en el historial de Git; la publicación final
mantiene la dirección principal y la dirección de vista previa.


## Edición definitiva 2.3

- [x] Sin demo, captura local, pruebas de animación ni códigos de ejemplo.
- [x] Colección accesible solo con sesión de cuenta.
- [x] Señal genérica del escáner antes y después de capturar.
- [x] Sin exportación, importación ni recuperación manual de respaldos.
- [x] Ingreso simplificado; avatar y paisaje se eligen al crear personaje.
- [x] Gimnasios con paisaje, emblemas, filtros, estados y detalle de hallazgos.
- [x] Doce medallas con identidad visual, requisito y progreso.
- [x] Mochila renovada sin objetos de prueba ni respaldo local.
- [x] Animación PNG, ilustraciones completas y 47 códigos conservados.
- [x] 33 pruebas actuales aprobadas. Las pruebas de demo se sustituyen por las del acceso definitivo.
