# Estado de BioDex 2.0

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
- [x] 21 pruebas automatizadas de lógica, flujo, integración y recursos pasan con servicios simulados.
- [x] Colección completa de 30 ilustraciones propias, optimizadas en WebP.
- [x] Orden de estilos corregido: el diseño nuevo prevalece sobre el antiguo.
- [x] Capturas y vista previa operativas aunque el navegador bloquee el almacenamiento.

## Pendiente antes de reemplazar la versión pública

- [ ] Crear la hoja del docente y ejecutar `instalarBioDex`.
- [ ] Desplegar Apps Script con la configuración permitida por la organización.
- [ ] Incorporar su URL `/exec` en `config.js`.
- [ ] Probar guardado real y recuperación desde dos navegadores/dispositivos.
- [ ] Revisar visualmente en móvil y computador. No se pudo ejecutar Chromium
      en el entorno de creación; está preparado `tests/ui-smoke.cjs`.
- [ ] Aprobar e integrar el remaster a `main` para publicarlo en la URL existente.

La rama de trabajo no reemplaza automáticamente el sitio actual. Mientras el
endpoint esté vacío, el remaster presenta solo una vista previa explícita.
