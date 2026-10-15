# Estado de BioDex 2.1 · FIELD-02

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
- [x] 31 pruebas automatizadas de lógica, flujo, integración y recursos pasan con servicios simulados.
- [x] Colección completa de 30 ilustraciones propias, optimizadas en WebP.
- [x] Orden de estilos corregido: el diseño nuevo prevalece sobre el antiguo.
- [x] Capturas y vista previa operativas aunque el navegador bloquee el almacenamiento.

## Única integración aplazada: Google Sheets

- [ ] Crear la hoja del docente y ejecutar `instalarBioDex`.
- [ ] Desplegar Apps Script con la configuración permitida por la organización.
- [ ] Incorporar su URL `/exec` en `config.js`.
- [ ] Probar guardado real y recuperación desde dos navegadores/dispositivos.

La vista previa se publica bajo `/preview/`. La raíz original permanece intacta
y el PR sigue separado para revisión. El endpoint se mantiene vacío por decisión
del usuario. Hasta conectar Sheets no hay cuentas reales, comprobación del PIN ni
recuperación del progreso en otro equipo. Las pruebas con servicios simulados no
sustituyen la comprobación del despliegue real de Google.
