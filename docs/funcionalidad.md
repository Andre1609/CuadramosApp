# Funcionalidades implementadas

Este documento explica los cambios realizados en el registro de operaciones de CuadramosApp y los términos técnicos usados. Describe el funcionamiento local actual; la integración con el nuevo login queda pendiente.

## 1. Qué cambió

Antes, el botón de guardar de `PantallaRegistrar.tsx` no registraba operaciones. Inicio e Historial mostraban listas de ejemplo independientes y Balance mostraba importes escritos directamente en el código.

Ahora se puede registrar, consultar, editar y eliminar operaciones. Las pantallas usan una misma lista de datos y los importes se calculan a partir de ella. Las operaciones se conservan en el dispositivo al cerrar y volver a abrir la aplicación.

## 2. Registrar un ingreso o un egreso

En la pestaña **Registrar**, el usuario selecciona el tipo de operación, introduce un monto y un concepto, y elige cuenta y categoría. Al pulsar **Guardar operación**, se validan los datos y se intenta guardarlos. Cuando el guardado termina correctamente, se limpian el monto y el concepto y aparece una confirmación.

Cada operación contiene estos datos:

| Campo del código | Qué significa | Ejemplo |
| --- | --- | --- |
| `id` | Identificador generado para distinguir la operación de las demás. | Se genera al guardar. |
| `tipo` | Indica si entra o sale dinero. | `ingreso` o `egreso` |
| `montoCentimos` | Importe guardado como un número entero de céntimos. | `1250` equivale a S/ 12.50. |
| `concepto` | Descripción escrita por el usuario. | Compra de alimentos |
| `cuentaId` | Identificador de la cuenta a la que pertenece. | `principal` |
| `categoria` | Clasificación de la operación. | Alimentación |
| `fecha` | Fecha y hora generadas automáticamente al registrar. | Se almacena como texto en formato ISO. |

Las tres cuentas disponibles son **Mi cuenta principal**, **Mis metas** y **Del día a día**. Son cuentas locales predefinidas; no están conectadas a cuentas bancarias. Empiezan en cero y sus saldos se obtienen de las operaciones registradas.

Las categorías dependen del tipo:

- **Ingreso:** Salario, Trabajo y Otros.
- **Egreso:** Alimentación, Comida y bebida, Hogar, Transporte, Entretenimiento, Salud y Otros.

Al seleccionar el tipo de operación, la categoría vuelve a **Otros** para evitar conservar una categoría incompatible.

### Validaciones del formulario

Validar significa comprobar que los datos cumplen las reglas antes de guardarlos:

- El concepto no puede estar vacío ni contener solamente espacios. Se eliminan los espacios sobrantes al principio y al final.
- El monto debe ser mayor que cero y menor que mil millones de soles.
- Se admiten hasta dos decimales, usando punto o coma: `12.50` y `12,50` son válidos.
- No se admiten letras, números negativos, más de dos decimales ni separadores de miles. Para mil soles se escribe `1000` o `1000.00`.
- La cuenta y la categoría deben pertenecer a las opciones disponibles.

El botón se deshabilita durante la carga inicial o el guardado. El estado compartido también impide ejecutar simultáneamente dos cambios de operaciones.

## 3. Guardado en el dispositivo

Se agregó la dependencia **AsyncStorage**, una biblioteca que permite guardar y recuperar información localmente en React Native.

`src/services/almacenamiento.ts` contiene dos funciones:

- `cargarOperaciones()`: lee los datos guardados y comprueba su estructura. Si todavía no hay datos, devuelve una lista vacía.
- `guardarOperaciones()`: convierte la lista de operaciones a texto JSON y la guarda.

La clave utilizada es `@cuadramos/operaciones/local/v1`. Una **clave** es el nombre con el que se identifica la información dentro del almacenamiento.

Primero se guarda la nueva lista en el dispositivo y después se actualizan las pantallas. Si el guardado falla, se mantienen los datos anteriores en pantalla y se muestra un error. Si falla la carga inicial, se ofrece reintentar y se bloquean los cambios para evitar sobrescribir información que no se pudo leer.

Este almacenamiento no constituye una copia de seguridad en la nube. Borrar los datos de la aplicación puede eliminar las operaciones. Actualmente todas pertenecen a un mismo espacio local; todavía no se separan por usuario.

## 4. Historial, búsqueda y detalle por cuenta

`PantallaHistorial.tsx` muestra las operaciones guardadas, con las más recientes primero. Cada fila presenta concepto, categoría, fecha, monto y tipo.

Se puede:

- Mostrar todos los movimientos o solo ingresos o egresos.
- Buscar por concepto o categoría. La búsqueda no distingue mayúsculas de minúsculas y se combina con el filtro de tipo.
- Ver un mensaje cuando no existen resultados.
- Tocar una fila para abrir el formulario de edición.

El historial incluye **todos los meses**. No se implementó todavía un selector para filtrar por mes.

En Inicio se muestran los últimos cuatro movimientos. Al abrir una cuenta, su detalle muestra únicamente las operaciones asociadas a ella y su saldo calculado.

## 5. Editar una operación

Desde el historial, al tocar un movimiento se abre `EditarOperacion.tsx` con los datos actuales. Se pueden cambiar monto, concepto, tipo, cuenta y categoría.

Al pulsar **Guardar cambios**:

1. Se validan los datos.
2. Se localiza la operación mediante su `id`.
3. Se guarda la lista con la operación modificada.
4. Se actualiza el estado compartido y se cierra el formulario.

La edición conserva el identificador y la fecha originales. No crea una segunda operación ni cambia la fecha al día de la edición. Si se cambia la cuenta, los saldos de la cuenta anterior y de la nueva se recalculan con la lista actualizada.

**Cancelar** cierra el formulario sin guardar lo que se haya escrito. Mientras se procesa un cambio, los campos y botones quedan deshabilitados. Si ocurre un error, el formulario sigue abierto para poder corregir o reintentar.

## 6. Eliminar una operación

El formulario de edición incluye **Eliminar operación**. Antes de borrar, aparece una confirmación con el concepto de la operación:

- **Cancelar:** conserva el registro.
- **Eliminar:** quita el registro de la lista y guarda el resultado.

La eliminación actualiza el historial, los saldos y el balance. No existe papelera ni opción de deshacer. Si el guardado falla, la operación permanece en los datos actuales.

## 7. Saldos y balance calculados

Los cálculos están separados en `src/utils/finanzas.ts` y en la preparación de los saldos por cuenta de Inicio.

| Resultado | Regla aplicada |
| --- | --- |
| Saldo de una cuenta | Todos sus ingresos menos todos sus egresos. |
| Saldo total | Suma de los saldos de las tres cuentas. |
| Ingresos del mes | Suma de ingresos del mes y año actuales. |
| Egresos del mes | Suma de egresos del mes y año actuales. |
| Balance neto mensual | Ingresos del mes menos egresos del mes. |
| Porcentaje gastado | Egresos divididos entre ingresos, multiplicado por 100 y redondeado. Si no hay ingresos, muestra «Sin ingresos este mes». |
| Ahorro sugerido | 20% del balance neto cuando es positivo, redondeado a céntimos. Si es cero o negativo, la sugerencia es cero. |
| Gastos hormiga | Suma y cantidad de egresos del mes inferiores a S/ 20. Un egreso de exactamente S/ 20 no se incluye. |

El estado mensual muestra **Sin movimientos** cuando no hay operaciones en el periodo, **Balance positivo** cuando los ingresos son mayores o iguales que los egresos y **Balance negativo** cuando los egresos son mayores. Es una regla simple de comparación, no una evaluación financiera completa.

El saldo de las cuentas considera todos los periodos; el balance mensual considera solo el mes actual según la fecha local del dispositivo. Por eso ambos importes pueden ser diferentes. Se permiten saldos negativos: no se agregó una restricción que impida registrar un gasto superior al saldo disponible.

### Ejemplo de funcionamiento

Partiendo de una cuenta vacía y realizando estas operaciones en el mismo mes:

1. Registrar un ingreso de S/ 100 deja el saldo en S/ 100.
2. Registrar un egreso de S/ 20 deja el saldo y el balance neto en S/ 80.
3. Editar ese egreso a S/ 30 deja ambos en S/ 70.
4. Eliminar ese egreso devuelve ambos a S/ 100.
5. Cerrar y abrir la app debe conservar el ingreso de S/ 100.

## 8. Organización de los archivos

| Archivo | Responsabilidad |
| --- | --- |
| `src/types/finanzas.ts` | Define los campos de una operación, los tipos permitidos y las cuentas y categorías disponibles. |
| `src/services/almacenamiento.ts` | Lee y guarda operaciones con AsyncStorage. |
| `src/context/FinanzasContext.tsx` | Comparte las operaciones entre pantallas y coordina registro, edición, eliminación, carga y errores. |
| `src/utils/finanzas.ts` | Valida y convierte montos, les da formato, prepara los datos visibles de los movimientos y calcula el resumen mensual. |
| `src/screens/PantallaRegistrar.tsx` | Recoge los datos del formulario y solicita el registro. |
| `src/screens/PantallaHistorial.tsx` | Lista, busca y filtra movimientos y permite abrir su edición. |
| `src/screens/PantallaPrincipal.tsx` | Muestra saldos, últimos movimientos y detalle por cuenta. |
| `src/screens/PantallaBalance.tsx` | Presenta el resumen mensual y las sugerencias calculadas. |
| `src/components/EditarOperacion.tsx` | Formulario de edición y confirmación de eliminación. |
| `src/styles/estilosEditarOperacion.ts` | Colores, tamaños, espacios y distribución del formulario de edición. |
| `App.tsx` | Envuelve la navegación con `FinanzasProvider` para que las pantallas accedan a los mismos datos. |
| `package.json` y `package-lock.json` | Declaran y registran la dependencia AsyncStorage utilizada por esta funcionalidad. |

También se convirtió el formulario de registro en contenido desplazable, se desactivó la apertura automática del modal de metas que todavía no guardaba datos, se quitó una tarjeta duplicada de gastos hormiga y se retiró la propiedad `backgroundColor` de los `StatusBar` de las cuatro pantallas financieras por incompatibilidad con los tipos instalados.

`NuevaTransaccion.tsx` no es la pantalla usada por este flujo: el registro conectado a la navegación es `PantallaRegistrar.tsx`. El login no se modificó como parte de estos cambios.

## 9. Términos técnicos explicados

| Término | Explicación sencilla |
| --- | --- |
| Operación o movimiento | Un registro de dinero que entra o sale. |
| Ingreso / egreso | Entrada / salida de dinero. |
| Estado | Datos que la aplicación mantiene en memoria mientras funciona, por ejemplo la lista de operaciones. |
| Context | Mecanismo de React para que varias pantallas consulten y cambien los mismos datos. Aquí evita tener una lista independiente en cada pantalla. |
| Provider | Componente que ofrece ese estado compartido a los componentes que están dentro de él. Aquí se llama `FinanzasProvider`. |
| Hook | Función de React que permite usar estado u otras capacidades en un componente. `useFinanzas()` es la función del proyecto que da acceso a las operaciones y sus acciones. |
| Persistencia | Conservar información después de cerrar la aplicación. El estado en memoria por sí solo no hace esto. |
| AsyncStorage | Biblioteca utilizada para la persistencia local. Guarda datos asociados a claves. |
| JSON | Formato de texto que representa listas y objetos. Se usa para convertir las operaciones a texto al guardar y recuperarlas al leer. |
| Asíncrono / `async` / `await` | Una operación que puede tardar, como guardar datos. `await` espera su resultado antes de continuar con los pasos que dependen de él. |
| ID | Identificador que permite encontrar exactamente qué operación editar o eliminar aunque varias tengan el mismo concepto. |
| Tipo o interfaz de TypeScript | Definición que ayuda a comprobar durante el desarrollo qué campos y valores debe tener un dato. La validación al leer almacenamiento se hace además en ejecución. |
| Céntimos | Unidad entera usada en los cálculos. S/ 12.50 se representa como 1250 para evitar acumular errores de operaciones con decimales. |
| Modal | Ventana o vista que se abre sobre la pantalla actual, como el formulario de edición. |
| Dependencia | Biblioteca externa que el proyecto necesita instalar para funcionar, como AsyncStorage. |
| Fecha ISO | Representación de fecha y hora como texto con un formato uniforme. Al mostrarla, se adapta a la fecha local del dispositivo. |

El recorrido de los datos es: **formulario → contexto → almacenamiento → actualización del estado → actualización de las pantallas**. Los estilos solo controlan la presentación visual.

## 10. Alcance pendiente y comprobaciones

Todavía queda pendiente asociar los datos al identificador del usuario del nuevo login. Actualmente cambiar el usuario no selecciona un conjunto distinto de operaciones. También quedan fuera de esta implementación el filtrado por mes desde la interfaz, las metas de ahorro persistentes, la exportación PDF, las notificaciones, el chatbot y la sincronización con un servidor.

Durante el desarrollo pasó la comprobación de TypeScript y se verificaron automáticamente cálculos, validación, persistencia y errores de almacenamiento. Para edición y eliminación se ejecutó una comprobación temporal que confirmó la conservación del ID y la fecha, el cambio de cuenta e importe, la persistencia del borrado y la conservación de datos cuando falla el guardado. Esa comprobación temporal se retiró después; no se dejó un archivo nuevo de pruebas para esa tarea.

La prueba general de `App` presentó un problema de configuración de Jest al interpretar React Navigation. Las comprobaciones mencionadas no sustituyen la revisión visual y de interacción: queda pendiente probar el flujo completo en emulador o dispositivo.

Como se agregó una dependencia nativa, para probar en Android hay que instalar las dependencias y recompilar la aplicación; recargar únicamente JavaScript no incorpora el nuevo módulo nativo.

```bash
npm install
npm run android
```

En PowerShell, si la política de ejecución impide usar `npm`, se puede invocar `npm.cmd install` y `npm.cmd run android`.

Para comprobar manualmente, se puede seguir el ejemplo de la sección 7, revisar Historial, Inicio y Balance después de cada paso y volver a abrir la aplicación para confirmar la persistencia. También conviene intentar guardar un concepto vacío o un monto inválido y cancelar una eliminación para comprobar que no se pierden datos.
