# Actualizar BioDex a 2.4 · captura libre y tres premios únicos

Esta actualización utiliza **la misma hoja y el mismo proyecto de Apps Script**
que ya están conectados. Conserva nombres, claves, capturas, preferencias y los
47 códigos originales. No crees una hoja nueva.

## 1. Reemplazar el código

1. Abre tu hoja de BioDex → **Extensiones → Apps Script**.
2. En `Code.gs` (o `Código.gs`), reemplaza **todo** el contenido por el `Code.gs`
   de este paquete. `Code_para_copiar.txt` contiene exactamente el mismo código
   para abrirlo y copiarlo con facilidad. Usa solo uno de los dos.
3. Guarda. Selecciona la función **instalarBioDex** y pulsa **Ejecutar**.
4. Espera «Ejecución completada». Se añade la pestaña **PremiosMega** con tres
   filas. El instalador conserva las cuentas, el secreto privado del servidor y
   los códigos de premio que ya existan. Puedes ejecutarlo otra vez sin borrarlos.

## 2. Actualizar la implementación que ya usas

**Implementar → Gestionar implementaciones → selecciona la implementación
activa → lápiz Editar → Versión: Nueva versión → Implementar.**

Conserva «Ejecutar como: Yo» y el acceso público que ya tenía tu aplicación.
Editar la implementación existente mantiene la misma URL `/exec`; no necesitas
enviar un enlace nuevo ni cambiar `config.js`.

Guardar el código solamente no actualiza la versión que usa la web.

## 3. Entregar los tres premios

La nueva pestaña **PremiosMega** solo debe verla el docente:

| Columna | Uso |
| --- | --- |
| A · id | B031, B032 o B033. No modificar. |
| B · bioforma | Astrael, Thalúmor o Ignivar. |
| C · codigo_privado | Código aleatorio generado en tu hoja. Entrega uno distinto a cada ganador. |
| D · ganador_opcional | Puedes escribir el nombre exacto de su cuenta antes de entregar el código. Así solo esa cuenta puede usarlo. |
| E · cuenta_canjeo | La aplicación registra automáticamente quién obtuvo el premio. |
| F · fecha_canjeo | Fecha de entrega registrada automáticamente. |

Cada premio admite **un ganador en toda esta hoja**, y cada cuenta puede recibir
**una sola mega legendaria**. Reintentar el mismo código desde la cuenta ganadora
no duplica el premio. Si el guardado se interrumpe, esa misma cuenta puede
reintentarlo; la reserva impide que otra se apropie del premio.

No publiques la hoja ni copies los códigos en GitHub. No borres las columnas E/F
para reasignar un premio: el avance del primer ganador seguiría existiendo.
Para probar, utiliza una copia de la hoja con un proyecto de prueba separado;
los tres códigos de producción están destinados a tus ganadores.

## 4. Qué cambia al activar la versión

- Cada una de las 30 bioformas originales se captura directamente con su código,
  sin tener la etapa anterior ni abrir un gimnasio. Los códigos CAP no cambian.
- Los gimnasios siguen abriéndose con sus códigos GYM; las miniaturas de sus
  paisajes se ven antes de abrirlos. Los sectores conservan sus códigos SEC.
- La BioDex incluye una galería de tres mega legendarias adicionales. No cuentan
  para completar las 30 bioformas ni para sus medallas.
- Cada captura se guarda antes de la animación. Las mega usan PNG transparente
  durante la captura e ilustración completa una vez obtenidas.
- Las claves, las cuentas y todo el progreso anterior se conservan.

Recarga [BioDex](https://nespinozagonzalez-hub.github.io/biodex/) y vuelve a ingresar,
o pulsa **Actualizar** si ya tienes una sesión. La web activa las nuevas reglas
cuando el servidor responde con la versión 2.4.0. Mientras el backend anterior
siga publicado, muestra sus reglas anteriores y oculta la galería de premios.

## 5. Comprobar la actualización

Abre tu URL `/exec`. Debe incluir:

```json
{"ok":true,"service":"BioDex","version":"2.4.0","features":{"version":"2.4.0","captureMode":"code-only","megaPrizes":3,"oneMegaPerAccount":true}}
```

Esta respuesta comprueba la versión, no una operación de guardado. Después revisa
una cuenta existente, una captura de etapa avanzada con su código y un reingreso
con el mismo nombre y clave. No gastes los premios reales durante la prueba.

El código 2.4 tiene pruebas automáticas con servicios de Apps Script simulados.
La comprobación de la implementación real debe hacerse después de este paso.

Referencia oficial de actualización de versiones conservando la URL:
https://developers.google.com/apps-script/concepts/deployments#edit_a_versioned_deployment
