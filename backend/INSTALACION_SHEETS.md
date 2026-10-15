# Activar cuentas y guardado de BioDex

Este paquete corresponde a BioDex 2.4 FIELD-02. Si tu hoja ya está conectada, sigue [ACTUALIZAR_2_4.md](ACTUALIZAR_2_4.md) para conservarla. Contiene `Code.gs`, una copia idéntica
en `Code_para_copiar.txt` y esta guía. Utiliza solo uno de los dos archivos de
código: no pegues ambos, ya que duplicarías las funciones.

El código guarda y recupera colección, códigos usados, sectores, gimnasios,
logros, avatar, paisaje y textura CRT. Las claves tienen exactamente seis dígitos
y se guardan como HMAC con sal y secreto privado, no como texto legible.

El script está validado con servicios simulados. La comprobación real de acceso
y guardado se hará después de recibir tu URL `/exec` y conectar la web.

## 1. Preparar la hoja privada

1. Crea una hoja **en blanco** en Google Sheets con tu cuenta de docente.
   Ponle el nombre **BioDex — Registro de exploradores**.
2. No la compartas con estudiantes ni actives «cualquier persona con el enlace».
3. Abre **Extensiones → Apps Script**.
4. Ponle al proyecto el nombre **BioDex — Cuentas y progreso**. En el archivo
   `Code.gs` o `Código.gs`, elimina la función de ejemplo y pega **todo** el
   contenido de `Code.gs` del paquete. Puedes abrir `Code_para_copiar.txt` con
   Bloc de notas y copiar su contenido si te resulta más cómodo.
5. Guarda el proyecto. En el selector de funciones, elige `instalarBioDex` y
   pulsa **Ejecutar**. Usa tu cuenta de docente y autoriza el proyecto que acabas
   de crear cuando Google te lo solicite.
6. Espera a que indique **Ejecución completada**. Vuelve a la hoja: aparecerán las
   cinco pestañas descritas abajo. La pestaña inicial `Hoja 1` puede permanecer;
   no se utiliza. No hace falta crear un activador o desencadenador.

**La función que ejecutas manualmente es `instalarBioDex`; no `doPost` ni `doGet`.**

| Pestaña | Qué guarda |
| --- | --- |
| Usuarios | Nombre, clave protegida y progreso completo de cada cuenta. |
| Sesiones | Sesiones temporales, almacenadas como hashes. |
| Bitacora | Registro de capturas, activaciones y cambios de preferencias. |
| Migraciones | Solicitudes de incorporación de colecciones anteriores. |
| PremiosMega | Tres códigos privados, ganador opcional y registro de entrega única. |

No añadas usuarios ni claves a mano en la hoja. Una vez conectada la web, cada
estudiante utiliza **Crear personaje** dentro de BioDex. Las cuentas reales
comienzan vacías.

La instalación es idempotente: no borra datos. Crea las pestañas **Usuarios**,
**Sesiones**, **Bitacora**, **Migraciones** y **PremiosMega** y guarda el ID de la hoja y un secreto
privado en las propiedades del script. Si detecta cabeceras incompatibles, se
detiene. No cambies las cabeceras ni el secreto después de registrar cuentas.

## 2. Desplegar el backend

1. Selecciona **Implementar → Nueva implementación → Aplicación web**.
   Si no aparece el tipo, pulsa el engranaje de selección de tipo.
2. Descripción: **BioDex FIELD-02 — acceso y progreso**.
3. Ejecutar como: **Yo / tu cuenta de docente**.
4. Quién tiene acceso: **Cualquier usuario**, incluida la posibilidad de entrar
   sin una cuenta de Google. No selecciones la opción limitada a usuarios con
   cuenta de Google. Esta disponibilidad depende de la organización.
5. Pulsa **Implementar** y copia la **URL de la aplicación web** que termina en
   `/exec`, no la URL del editor ni una URL `/dev`.
6. Devuelve esa URL a quien conecta la web. Se añadirá a `config.js`, en
   `endpoint`, y se publicará el cambio de conexión.

Puedes abrir la URL `/exec` en una ventana privada para comprobar que responde:

```json
{"ok":true,"service":"BioDex","version":"2.4.0","features":{"version":"2.4.0","captureMode":"code-only","megaPrizes":3,"oneMegaPerAccount":true}}
```

Ese número corresponde a la versión de la API del backend, no al tema visual.
Esta respuesta confirma que el servicio está accesible; todavía no demuestra
que el registro y el guardado real funcionan.

Para devolver el enlace, usa **la URL original del cuadro de implementación**.
Al abrirla, Google puede redirigirte a una dirección temporal de
`script.googleusercontent.com`: esa dirección temporal no es la que necesitamos.

Si tu organización no permite una aplicación web pública, no evadas la restricción:
consulta una alternativa aprobada por su administrador.

La hoja sigue privada aunque la aplicación sea accesible. El backend se ejecuta
como docente y solo admite las acciones definidas en `doPost`.

## 3. Comprobar con dos dispositivos antes de usar en clase

- Crear una cuenta de prueba con nombre único y PIN de seis dígitos.
- Capturar una etapa avanzada con su código, sin tener etapas anteriores ni gimnasios: debe guardarse.
- Capturar las otras etapas en cualquier orden: todas deben quedar registradas.
- Activar un sector SEC y un gimnasio GYM; alternar CRT y comprobar las tres cosas.
- Cambiar avatar y paisaje desde Perfil; comprobar que ambos quedan guardados.
- Cerrar sesión. Ingresar desde otro navegador con las mismas credenciales.
- Verificar colección, logros, sectores, gimnasios y configuración recuperados.
- Reintentar un código: no debe duplicar nada.
- Verificar que otra cuenta no ve esa colección.
- Probar sin conexión: no debe aparecer una captura como guardada.
- Verificar que `Usuarios.pin_hmac` no contiene el PIN legible.

**No se ha verificado el guardado real hasta completar esta prueba con tu URL.**
Apps Script tiene cuotas y límites de concurrencia: prueba primero con el tamaño
de tu curso y evita prometer disponibilidad de un backend comercial.

## Cuentas, nombres y recuperación

- Dos personas no pueden usar exactamente el mismo nombre normalizado. Acordar
  nombre + apellido o alias con un sufijo evita confusiones.
- No se necesitan correos, RUT ni fechas de nacimiento.
- Cada sesión dura ocho horas. La clave no se almacena en el navegador.
- Cinco intentos fallidos bloquean temporalmente el acceso durante quince minutos.
- Cerrar sesión no borra el avance; cerrar la pestaña elimina el token de esa pestaña.

Para restablecer una clave, crea **solo en el editor privado de Apps Script** una
función temporal que llame `restablecerClaveDocente(nombre, nuevaClave)`, usando
la clave como cadena para conservar ceros iniciales. Ejecútala y elimina la función
temporal. Esto conserva el progreso, restablece el bloqueo y revoca las sesiones.
No publiques esa función con datos reales en este repositorio.

En las propiedades del script, `REGISTRO_ABIERTO=false` cierra nuevas inscripciones
sin impedir el acceso a las cuentas existentes.

## Migración de colecciones antiguas

El archivo local original no se borra. La interfaz definitiva usa cuentas y ya no
expone importación ni recuperación manual. Se conserva la revisión docente de
solicitudes antiguas en **Migraciones** mediante `aprobarMigracionDocente(numeroDeFila)`
desde una función privada temporal. Une capturas originales, no reemplaza el avance
y nunca concede mega legendarias. Las etapas pueden incorporarse en cualquier orden.

## Premios mega

Consulta [ACTUALIZAR_2_4.md](ACTUALIZAR_2_4.md) para entregar los tres códigos privados
de **PremiosMega**. Un ganador por premio y una mega por cuenta. Puedes reservar
cada código al nombre de cuenta del ganador en la columna D. No uses premios de
producción para probar; utiliza una copia de la hoja y un proyecto separados.

## Actualizaciones y mantenimiento

Tras modificar Code.gs, actualiza la implementación existente para conservar la
misma URL `/exec`. No publiques la hoja ni compartas el proyecto de Apps Script.
Las sesiones vencidas pueden eliminarse manualmente de la pestaña Sesiones.
La bitácora es de uso educativo; el snapshot de progreso contiene además el registro
de activaciones. Exporta periódicamente la hoja como respaldo del docente.

## Dudas frecuentes durante la instalación

- **No se crearon las pestañas:** ejecuta `instalarBioDex` desde el proyecto
  abierto mediante Extensiones de esa hoja, y revisa si terminó correctamente.
- **Error al ejecutar `doPost`:** esa función recibe solicitudes de la web; no se
  prueba con el botón Ejecutar. Selecciona `instalarBioDex` para la instalación.
- **La URL pide iniciar sesión en Google:** revisa el acceso de la implementación.
  No cambies el enlace compartido de la hoja; hoja y aplicación son permisos distintos.
- **Cambiaste el código y `/exec` sigue igual:** usa Implementar → Gestionar
  implementaciones → Editar → Nueva versión → Implementar, conservando la misma URL.
- **BioDex todavía dice que Sheets está pendiente:** es normal hasta que se
  configure y publique tu endpoint. Crear la hoja por sí solo no conecta la web.

Referencias oficiales consultadas para el despliegue:

- https://developers.google.com/apps-script/guides/web
- https://developers.google.com/apps-script/manifest/web-app-api-executable
- https://developers.google.com/apps-script/guides/content
