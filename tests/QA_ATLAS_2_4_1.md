# Atlas de BioNova · 2.4.1

`node --test tests/*.test.cjs`: **48 pruebas aprobadas**.

## Cambios

- Siete paisajes pixel art diferentes, visibles antes de abrir los territorios.
- Índice de los siete territorios, filtros de apertura y fichas de los parajes.
- Se conservan las siete aperturas SEC, los diez gimnasios GYM y los 30 códigos CAP.
- La apertura solo se acredita al confirmar la respuesta del servidor.
- Capturar las bioformas de un territorio no lo abre por sí solo.
- Los filtros, estados, cantidades y fichas utilizan el progreso recibido.
- Cada territorio contiene sus tres parajes originales; no son nuevos gimnasios
  con códigos adicionales. La Liga mantiene sus diez gimnasios independientes.
- El backend, la hoja y el sistema de cuentas no se modifican en esta edición.

## Verificación

Las pruebas de frontend utilizan un DOM simulado y las de backend simulan los
servicios de Google. Los siete WebP son diferentes y están optimizados; juntos
pesan menos de 1,4 MB. Se inspeccionaron las siete ilustraciones en una hoja de
contacto. Los renderizadores generan los estados cerrado, abierto, en progreso,
completado, filtros y detalles sin errores.

No se completó la inspección visual en un navegador para esta edición: el
conector Browser devolvió dos veces `UNAVAILABLE / Sheep MCP session closed:
RPC INTERNAL`. No se atribuyen revisiones de navegador ni pruebas en móviles
físicos a esta versión.

Los códigos se entregan directamente al docente en la conversación. Se extrajeron
del backend y se verificaron contra la lista de los 47 códigos originales.
La revisión automática rechazó crear un nuevo documento público de códigos; se
optó por entregar la lista al docente sin añadir ese documento al repositorio.
Las nuevas pruebas del atlas se publican por separado en `territorios.test.cjs`
con un código ficticio de red. El archivo histórico `frontend.test.cjs` permanece
sin cambios y no se vuelve a cargar con copias de códigos funcionales.

La nueva versión del HTML retira sus copias de códigos CAP/SEC/GYM. Las acciones
remotas siguen validando los mismos 47 códigos en el backend sin cambios. Una
prueba adicional comprueba que el HTML ya no contenga esos valores funcionales.
