# Notificaciones locales

Acceso: campana de Inicio, Registrar, Historial o Balance; también Perfil → Notificaciones.

- Las opciones empiezan desactivadas. Al guardar una opción activa se solicita permiso al sistema.
- Preferencias separadas por cuenta y dispositivo: recordatorio diario, alertas de gastos, resumen semanal, hora, día semanal y mensajes discretos.
- Se programa una ventana de 28 días (máximo 32 avisos pendientes). Se renueva al iniciar sesión, actualizar movimientos, guardar preferencias o volver a la app. Después de cuatro semanas sin abrirla no se programan nuevos recordatorios.
- El recordatorio diario se omite cuando hay un movimiento financiero con fecha de hoy. Los registros retroactivos no lo omiten.
- El resumen es un aviso para revisar los últimos siete días naturales, incluido hoy. Al tocarlo y autenticarse se calculan los totales actuales; no se guardan cifras que podrían quedar desactualizadas en un aviso futuro.
- Los umbrales se evalúan con movimientos del mes actual al sincronizar datos. Se avisa al llegar al 80% y al superar el 100%. Cada umbral se reserva en almacenamiento antes de enviar. Si se pasa directamente al déficit, se marca también el 80% para evitar un aviso menor posterior.
- Los textos nunca contienen montos. Los mensajes discretos identifican el recordatorio sin mostrar porcentajes ni detalles de gastos. Android usa visibilidad privada.
- Cerrar sesión explícitamente cancela avisos. El cierre automático de seguridad al poner la app en segundo plano conserva recordatorios. Al ingresar con otra cuenta se limpian los avisos y enlaces de la anterior.
- Al tocar un aviso de registro se abre Registrar; uno de gastos abre Balance en el mes actual; el semanal abre Historial con el resumen de siete días. Una ventana flotante muestra el título y mensaje del aviso; al cerrarla permanece la pantalla correspondiente. Se exige autenticación y se comprueba la cuenta del aviso.

## Integración nativa

Se añadió `@notifee/react-native`. Es necesario recompilar e instalar la app; recargar Metro no añade módulos nativos.

Android usa WorkManager para horarios aproximados, sin pedir permisos de alarmas exactas. El ahorro de batería, canales bloqueados y la detención forzada pueden impedir o retrasar los avisos. Se incluyeron `POST_NOTIFICATIONS` y un icono monocromático.

En iOS, instalar los pods y compilar con Xcode en macOS. No se necesita servidor push ni credenciales de Firebase para esta integración local. La entrega en dispositivo iOS queda pendiente de validación.

Referencias: [instalación de Notifee](https://notifee.app/react-native/docs/installation/), [programación de avisos](https://notifee.app/react-native/docs/triggers/), [eventos al tocar una notificación](https://notifee.app/react-native/docs/events/). Se usan avisos de una sola ejecución para evitar la limitación de iOS que ignora el día inicial de una repetición diaria.

## Comprobación en teléfono

1. Abrir la campana, activar un recordatorio, elegir una hora próxima y guardar. Aceptar el permiso.
2. Poner la app en segundo plano sin pulsar Cerrar sesión. Comprobar la entrega y que al tocar se solicita ingreso y se abre el destino.
3. Registrar un movimiento con fecha de hoy antes de la hora elegida. Verificar que ese recordatorio se cancela.
4. Activar gastos con ingresos 100 y gastos 80: esperar un aviso. Editar/reabrir: no debe repetirse. Subir gastos a 101: un segundo aviso. Cambiar de mes: los umbrales se reinician.
5. Desactivar todas las opciones, cerrar sesión explícitamente y cambiar de cuenta: no deben quedar avisos de la cuenta anterior.
6. Revocar permiso o bloquear el canal en el teléfono: comprobar el mensaje del panel y volver a guardar después de habilitarlo.
7. Probar el resumen semanal sin movimientos, con varios días y con texto Muy grande.

Pruebas automatizadas: `notificaciones.test.ts` y `servicioNotificaciones.test.ts` cubren fechas, importes, exclusión de metas, límite de programación, duplicados, permisos, cancelación, errores y destinos por cuenta.
