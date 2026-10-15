# Activar cuentas y guardado de BioDex

## 1. Preparar la hoja privada

1. Crea una hoja de Google Sheets dedicada a BioDex con tu cuenta de docente.
2. No la compartas con estudiantes ni actives «cualquier persona con el enlace».
3. Abre **Extensiones → Apps Script**.
4. Sustituye el contenido del archivo `Code.gs` por el archivo de esta carpeta.
5. Guarda y ejecuta `instalarBioDex`. Autoriza el acceso solicitado por Google.

La instalación es idempotente: no borra datos. Crea las pestañas **Usuarios**,
**Sesiones**, **Bitacora** y **Migraciones** y guarda el ID de la hoja y un secreto
privado en las propiedades del script. Si detecta cabeceras incompatibles, se
detiene. No cambies las cabeceras ni el secreto después de registrar cuentas.

## 2. Desplegar el backend

1. Selecciona **Implementar → Nueva implementación → Aplicación web**.
2. Ejecutar como: **tu cuenta**.
3. Acceso: la opción que permita ingresar a tus estudiantes sin iniciar sesión de
   Google, normalmente **Cualquier usuario**. Tu organización puede restringirla.
4. Copia la URL que termina en `/exec`, no la URL del editor ni una URL `/dev`.
5. Colócala en `config.js`, en `endpoint`, conservando las comillas.
6. Publica ese cambio en la rama que usa GitHub Pages.

Si tu organización no permite una aplicación web pública, no evadas la restricción:
consulta una alternativa aprobada por su administrador.

La hoja sigue privada aunque la aplicación sea accesible. El backend se ejecuta
como docente y solo admite las acciones definidas en `doPost`.

## 3. Comprobar con dos dispositivos antes de usar en clase

- Crear una cuenta de prueba con nombre único y PIN de seis dígitos.
- Intentar una evolución sin su etapa anterior: debe bloquearse sin consumir código.
- Capturar la etapa inicial y luego su evolución: ambas deben quedar registradas.
- Activar un sector SEC y un gimnasio GYM; alternar CRT y comprobar las tres cosas.
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

El archivo local original no se borra. En **Archivo**, el estudiante puede recuperar
su respaldo anterior y enviarlo para revisión. El docente revisa la fila de
**Migraciones** y, si corresponde, ejecuta `aprobarMigracionDocente(numeroDeFila)`
desde una función privada temporal. La aprobación une colecciones, no reemplaza
avances existentes, y respeta la cadena evolutiva: no inventa etapas faltantes.

## Actualizaciones y mantenimiento

Tras modificar Code.gs, actualiza la implementación existente para conservar la
misma URL `/exec`. No publiques la hoja ni compartas el proyecto de Apps Script.
Las sesiones vencidas pueden eliminarse manualmente de la pestaña Sesiones.
La bitácora es de uso educativo; el snapshot de progreso contiene además el registro
de activaciones. Exporta periódicamente la hoja como respaldo del docente.
