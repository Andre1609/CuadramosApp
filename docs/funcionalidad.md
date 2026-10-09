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
| `fecha` | Fecha de la operación elegida por el usuario; inicialmente se propone hoy. | Se almacena como texto en formato ISO. |

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

El historial permite elegir un mes y año, o **Todos los meses**. El periodo se combina con la búsqueda y el filtro de ingresos/egresos.

Inicio muestra el saldo total y las cuentas; el listado general de movimientos se consulta en Historial. Al abrir una cuenta, su detalle muestra únicamente las operaciones asociadas a ella y su saldo calculado.

## 5. Editar una operación

Desde el historial, al tocar un movimiento se abre `EditarOperacion.tsx` con los datos actuales. Se pueden cambiar monto, concepto, tipo, cuenta, categoría y fecha.

Al pulsar **Guardar cambios**:

1. Se validan los datos.
2. Se localiza la operación mediante su `id`.
3. Se guarda la lista con la operación modificada.
4. Se actualiza el estado compartido y se cierra el formulario.

La edición conserva el identificador. La fecha se mantiene si no se modifica; también puede corregirse desde el formulario. No se crea una segunda operación. Si se cambia la cuenta, los saldos de la cuenta anterior y de la nueva se recalculan con la lista actualizada.

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
| Ingresos del mes | Suma de ingresos del mes y año seleccionados. |
| Egresos del mes | Suma de egresos del mes y año seleccionados. |
| Balance neto mensual | Ingresos del mes menos egresos del mes. |
| Porcentaje gastado | Egresos divididos entre ingresos, multiplicado por 100 y redondeado. Si no hay ingresos, muestra «Sin ingresos este mes». |
| Ahorro sugerido | 20% del balance neto cuando es positivo, redondeado a céntimos. Si es cero o negativo, la sugerencia es cero. |
| Gastos hormiga | Suma y cantidad de egresos del mes inferiores a S/ 20. Un egreso de exactamente S/ 20 no se incluye. |

El indicador visual del balance utiliza el porcentaje de ingresos gastados para elegir su color y mensaje; las reglas se detallan en la sección 13. Es una referencia orientativa, no una evaluación financiera completa.

El saldo de las cuentas considera todos los periodos; Balance permite consultar el mes y año seleccionados; inicialmente propone el mes actual del dispositivo. Por eso ambos importes pueden ser diferentes. Se permiten saldos negativos: no se agregó una restricción que impida registrar un gasto superior al saldo disponible.

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
| `src/screens/PantallaPrincipal.tsx` | Muestra saldo total, cuentas y detalle por cuenta. |
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

Todavía queda pendiente asociar los datos al identificador del usuario del nuevo login. Actualmente cambiar el usuario no selecciona un conjunto distinto de operaciones. También quedan fuera de esta implementación las metas de ahorro persistentes, las notificaciones, el chatbot y la sincronización con un servidor.

Durante el desarrollo pasó la comprobación de TypeScript y se verificaron automáticamente cálculos, validación, persistencia y errores de almacenamiento. Para edición y eliminación se ejecutó una comprobación temporal que confirmó la conservación del ID y la fecha, el cambio de cuenta e importe, la persistencia del borrado y la conservación de datos cuando falla el guardado. Esa comprobación temporal se retiró después; no se dejó un archivo nuevo de pruebas para esa tarea.

La prueba general de `App` presentó un problema de configuración de Jest al interpretar React Navigation. Las comprobaciones mencionadas no sustituyen la revisión visual y de interacción: queda pendiente probar el flujo completo en emulador o dispositivo.

Como se agregó una dependencia nativa, para probar en Android hay que instalar las dependencias y recompilar la aplicación; recargar únicamente JavaScript no incorpora el nuevo módulo nativo.

```bash
npm install
npm run android
```

En PowerShell, si la política de ejecución impide usar `npm`, se puede invocar `npm.cmd install` y `npm.cmd run android`.

Para comprobar manualmente, se puede seguir el ejemplo de la sección 7, revisar Historial, Inicio y Balance después de cada paso y volver a abrir la aplicación para confirmar la persistencia. También conviene intentar guardar un concepto vacío o un monto inválido y cancelar una eliminación para comprobar que no se pierden datos.

## 11. Fecha de operación y consulta por mes

Se agregó un campo de fecha tanto al registro como a la edición. Se escribe **DD/MM/AAAA** (por ejemplo, `15/09/2026`); el registro propone la fecha de hoy. No requiere instalar otra biblioteca ni modificar el login.

- Se aceptan fechas desde 1900 hasta hoy según el dispositivo.
- Se rechazan fechas futuras, formatos incompletos y días inexistentes, como `31/02/2026`. La validación considera años bisiestos (años en los que febrero tiene 29 días).
- Al guardar un nuevo registro correctamente, la fecha vuelve a hoy.
- Al editar sin cambiar la fecha, se conserva el valor original completo. Si se cambia, la operación pasa al periodo correspondiente y se actualizan los resúmenes.
- Las operaciones se ordenan por fecha de operación, de más reciente a más antigua, también al recuperar el almacenamiento. Este orden se utiliza en Historial y en el detalle de cada cuenta.

**Historial:** el botón del periodo abre un selector con los doce meses y botones para cambiar de año. Incluye «Todos los meses», que es la selección inicial. El mes se combina con la búsqueda por texto y el filtro de tipo. Si no hay coincidencias, se muestra el mensaje de lista vacía.

**Balance:** utiliza el mismo selector, sin la opción «Todos los meses». Al cambiar de periodo se recalculan ingresos, egresos, neto, porcentaje gastado, ahorro sugerido y gastos hormiga. Un mes sin operaciones muestra importes en cero y «Sin movimientos». Los saldos de las cuentas de Inicio siguen considerando todos los periodos.

La selección de mes de cada pantalla es independiente y se mantiene mientras esa pantalla permanezca montada; no se guarda como preferencia al reiniciar la aplicación. El selector permite consultar meses vacíos, incluso meses posteriores dentro del año actual, aunque no se permite registrar operaciones futuras.

### Archivos de este cambio

| Archivo | Función |
| --- | --- |
| `src/components/CampoFecha.tsx` | Campo reutilizable con etiqueta e indicación del formato de fecha. |
| `src/components/SelectorMes.tsx` | Ventana reutilizable para elegir mes y año, cerrar sin cambiar y, en Historial, ver todos los meses. |
| `src/styles/estilosFechas.ts` | Presentación del campo y del selector, separada de su comportamiento. |
| `src/utils/fechas.ts` | Validación y conversión de fechas, nombres de meses y claves para filtrar. |
| `src/types/finanzas.ts` | Permite enviar una fecha opcional en `NuevaOperacion`; los formularios ahora la envían. |
| `src/context/FinanzasContext.tsx` | Valida la fecha recibida, la guarda, permite corregirla y ordena las operaciones. Si una llamada de registro no envía fecha, usa el momento actual; si una edición no la envía, conserva la anterior. |
| `src/screens/PantallaRegistrar.tsx` y `src/components/EditarOperacion.tsx` | Integran el campo de fecha y envían su valor al guardar. |
| `src/screens/PantallaHistorial.tsx` y `src/screens/PantallaBalance.tsx` | Integran la selección de periodo y aplican el filtro o cálculo correspondiente. |

### Términos y decisiones sobre fechas

- **Periodo:** combinación de mes y año que se está consultando. Septiembre de 2025 y septiembre de 2026 son periodos distintos.
- **Clave de mes:** texto como `2026-09`, usado internamente para comparar el año y mes de una operación con la selección.
- **Fecha de operación:** día al que pertenece el ingreso o gasto; puede ser anterior al día en que se introduce en la app. No se agregó un campo separado de fecha de creación.
- **Hora local y UTC:** la hora local corresponde a la zona horaria del dispositivo; UTC es una referencia común para almacenar instantes. La fecha escrita se convierte desde el mediodía local a texto ISO. Esto evita interpretarla accidentalmente como medianoche UTC y mostrar el día anterior en Perú. Los registros anteriores siguen siendo compatibles. Cambiar la zona horaria del dispositivo puede alterar la fecha local mostrada, porque el almacenamiento continúa representando instantes.

### Cómo comprobarlo

1. Registrar un ingreso de S/ 100 y un egreso de S/ 25 con una fecha del mes anterior.
2. Elegir ese mes en Historial: deben aparecer ambos. Combinar con «Egresos» y una búsqueda para comprobar los filtros.
3. Elegir ese mes en Balance: debe mostrar ingresos S/ 100, egresos S/ 25 y neto S/ 75 si no existen otras operaciones del periodo.
4. Editar la fecha del egreso y moverlo al mes actual. El mes anterior debe quedar con neto S/ 100; el egreso aparecerá en el periodo actual.
5. Probar una fecha inexistente y una futura: el formulario debe impedir guardar y mostrar el motivo.
6. Reiniciar la aplicación y comprobar que las fechas se conservan. Seleccionar un mes sin operaciones para comprobar el estado vacío.

## 12. Contenido separado por pestaña

Se retiraron de Inicio las secciones de últimos movimientos y balance mensual, además de las tarjetas informativas que alargaban la pantalla. Cada apartado tiene su propio contenido:

- **Inicio:** saludo, saldo total, botón para registrar y cuentas con sus detalles.
- **Registrar:** formulario para agregar una operación.
- **Historial:** listado, búsqueda, filtros, edición y eliminación.
- **Balance:** resumen del periodo y sugerencias calculadas.

La barra inferior permite cambiar entre estos apartados. Se conserva el desplazamiento dentro de cada pantalla cuando su contenido no cabe en el celular; deslizar Inicio ya no muestra copias del historial y del balance. Los movimientos de una cuenta se siguen mostrando al abrir su detalle.

## 13. Indicador de balance dinámico

Se reemplazó la carita fija y el anillo decorativo por un indicador que representa **egresos del periodo / ingresos del periodo × 100**. Se actualiza al elegir otro mes y al registrar, editar o eliminar operaciones.

| Situación | Color | Carita y mensaje |
| --- | --- | --- |
| Menos del 80% gastado | Verde | 🙂 Tienes margen |
| Del 80% al 100%, inclusive | Amarillo | 😐 Cerca de tu límite |
| Más del 100% | Rojo | 😟 Gastos superiores a ingresos |
| Gastos sin ingresos | Rojo | 😟 Gastos sin ingresos registrados |
| Sin ingresos ni gastos | Gris | — Sin movimientos |

El anillo se llena en sentido horario desde arriba y se limita a una vuelta. Por ejemplo, ingresos de S/ 1,000 y gastos de S/ 600 lo llenan al 60%; gastos de S/ 1,200 lo llenan completamente y muestran 120%. Con ingresos pero sin gastos, muestra 0% y un mensaje verde. Cuando no hay ingresos, muestra un guion en lugar de dividir entre cero. El porcentaje visible admite hasta dos decimales; los colores se calculan usando la proporción sin redondear.

Estos límites son una regla orientativa del proyecto. El indicador mide dinero gastado respecto de los ingresos del mes seleccionado; no representa el avance de una meta ni el saldo acumulado de todas las cuentas. Incluye texto y porcentaje para que la información no dependa solo del color.

Archivos agregados:

- `src/utils/indicadorBalance.ts`: calcula porcentaje, progreso entre 0 y 1, color, carita y mensaje.
- `src/components/IndicadorBalance.tsx`: dibuja el anillo con segmentos y presenta los resultados. Su actualización es inmediata; no incorpora una animación temporal.
- `src/styles/estilosIndicadorBalance.ts`: define el tamaño y la presentación del indicador.

`PantallaBalance.tsx` proporciona los totales del periodo al componente. No se agregaron dependencias nativas ni se modificó el login. Se comprobaron los límites del 80% y 100%, el exceso de gasto, el periodo vacío y los gastos sin ingresos. Queda pendiente la comprobación visual en el celular.

## 14. Ajustes visuales del saldo y del detalle de cuentas

### Saldo oculto en Inicio

Los puntos que ocultan el saldo total ocupaban demasiado espacio y podían dividirse en dos filas. Se sustituyeron por seis puntos sin espacios, se redujo su tamaño y se agregó un estilo específico para el saldo oculto. El texto se limita a una línea y puede reducir su tamaño para ajustarse al espacio disponible. Cuando está oculto, el lector de pantalla anuncia «Saldo oculto».

Archivos: `src/screens/PantallaPrincipal.tsx` y `src/styles/estilosPrincipal.ts`. Este ajuste no cambia los importes ni la acción de mostrar u ocultar el saldo.

### Anillo de Balance más visible

Se aumentó el diámetro del componente de 192 a 220 unidades de diseño y el grosor de los segmentos de 12 a 26. También se amplió su ancho para que se solapen y formen visualmente una franja continua. Los colores, porcentajes y límites de la sección 13 permanecen iguales: por ejemplo, ingresos de S/ 100 y egresos de S/ 50 del mismo mes llenan la mitad del anillo de verde.

Archivos: `src/components/IndicadorBalance.tsx` y `src/styles/estilosIndicadorBalance.ts`.

### Tabla del detalle de una cuenta

Antes, el detalle concatenaba concepto, fecha y monto en un único texto dentro del contenedor utilizado para el estado vacío. Esto centraba los datos y los separaba de los encabezados.

Ahora cada operación tiene una fila con tres columnas, cuyas proporciones coinciden con las de los encabezados:

- **Movimiento:** concepto y categoría a la izquierda. Los conceptos largos pueden ocupar varias líneas.
- **Fecha:** día y mes, con el año debajo, alineados al centro.
- **Monto:** importe con su color de ingreso o egreso y tipo debajo, alineados a la derecha. El importe se ajusta a una línea.

Se agregaron separadores entre filas y una lista desplazable independiente. El mensaje centrado de cuenta vacía solo se utiliza cuando no hay operaciones. Se conservan el saldo calculado y el botón para registrar.

Archivos: `src/screens/PantallaPrincipal.tsx` y `src/styles/estilosPrincipal.ts`. La comprobación de TypeScript pasó después de estos ajustes; el aspecto final debe revisarse en el celular. Para verlos basta recargar la aplicación con Metro conectado, sin recompilar la parte nativa.

## 15. Cuenta preseleccionada al registrar desde su detalle

Al abrir una cuenta en Inicio y pulsar «Registrar una operación», el formulario selecciona automáticamente esa cuenta. Por ejemplo, entrar desde «Mis metas» prepara el registro para «Mis metas».

El usuario puede cambiar de cuenta manualmente. Se conservan el monto, concepto, fecha y demás datos que ya estuvieran escritos en el formulario. Al entrar directamente desde la barra inferior o el botón general de Inicio se mantiene la selección anterior; al abrir por primera vez el formulario, la cuenta inicial es «Mi cuenta principal».

La navegación transmite un **parámetro**, es decir, un dato adicional al abrir una pantalla: `cuentaId`. Registrar comprueba que ese identificador corresponde a una cuenta disponible y lo aplica. Después limpia el parámetro para que no vuelva a imponer esa selección al regresar a la pestaña y para permitir entrar nuevamente desde la misma cuenta. La selección permanece en el formulario aunque se limpie el parámetro.

Archivos involucrados:

- `src/types/navegacion.ts`: define las pestañas y los parámetros que acepta Registrar.
- `App.tsx`: conecta esos tipos al navegador de pestañas.
- `src/screens/PantallaPrincipal.tsx`: envía el identificador de la cuenta abierta.
- `src/screens/PantallaRegistrar.tsx`: recibe, valida y aplica la cuenta; cierra cualquier desplegable abierto.

Comprobación de TypeScript: correcta. Para verificar en el celular, abrir «Mis metas», pulsar registrar y comprobar la cuenta. Cambiarla manualmente, volver a Inicio y repetir desde «Mis metas»: debe volver a seleccionarla. Registrar una operación y revisar que afecta al saldo de la cuenta elegida. No se cambió el login ni el almacenamiento y no se agregaron dependencias.

## 16. Gráfico simplificado: gastado y restante

Esta mejora sustituye el diseño y las reglas visuales de la sección 13: el gráfico ya no utiliza caritas ni umbrales del 80% y 100%. Se conservaron las demás tarjetas de Balance y sus cálculos.

- Con ingresos suficientes, el naranja representa lo gastado y el verde lo restante del mes seleccionado. Con S/ 1,000 de ingresos y S/ 600 de gastos, el anillo es 60% naranja y 40% verde.
- El centro muestra «Te quedaron» y el importe restante. Debajo, la leyenda identifica los montos gastado y restante mediante texto y color.
- Si los gastos superan los ingresos, incluso si no hubo ingresos, el anillo completo es rojo y el centro muestra «Te faltaron» con la diferencia positiva.
- Si se gastó exactamente todo el ingreso, el anillo es naranja y quedaron S/ 0.00. Si no hubo gastos pero sí ingresos, es verde completo.
- Sin movimientos, el círculo es gris e invita a registrar un ingreso o gasto.

El texto aclara que solo considera los movimientos registrados del mes seleccionado, sin incluir dinero de meses anteriores. Los segmentos siguen formando un anillo grueso de 220 unidades de diámetro.

Se modificaron `src/components/IndicadorBalance.tsx` y `src/styles/estilosIndicadorBalance.ts`. El componente dejó de utilizar la función anterior de `src/utils/indicadorBalance.ts`. TypeScript pasó; falta revisar el resultado visual en el celular. No se agregaron dependencias ni se cambiaron las otras secciones de la pantalla.

## 17. Gráfico con porcentaje, sin repetir importes

Esta actualización sustituye el contenido central y la leyenda descritos en la sección 16. El centro ahora muestra «Gastaste el 60% de tus ingresos», por ejemplo, y la leyenda solo dice «Gastado» (naranja) y «Restante» (verde). Los importes exactos siguen en las tarjetas de Balance.

El porcentaje se calcula con los ingresos y egresos del periodo y muestra hasta dos decimales. Cuando supera el 100%, se conserva el porcentaje real y se muestra el anillo completo rojo, con la leyenda «Gastos superiores a ingresos», sin indicar un restante inexistente. Con gastos pero sin ingresos, el centro muestra «Gastos sin ingresos» y no calcula porcentaje. Sin movimientos se conserva el estado gris.

Se actualizaron `src/components/IndicadorBalance.tsx` y `src/styles/estilosIndicadorBalance.ts`, incluyendo el texto para lectores de pantalla. No se modificaron las tarjetas ni los cálculos del resumen mensual. TypeScript pasó; la revisión visual se realiza recargando en el celular.

## 18. Exportación del reporte PDF

El botón «Exportar reporte PDF» del Historial genera un documento A4 con:

- Nombre de la aplicación, periodo y fecha/hora de generación.
- Cantidad de operaciones, total de ingresos, egresos y resultado del periodo.
- Total de gastos por categoría, ordenados de mayor a menor.
- Tabla cronológica con fecha, concepto, cuenta, categoría e importes separados en columnas de ingreso y egreso.
- Totales finales, números de página y aclaración de que se utilizan los movimientos registrados.

Antes de generar se explica el alcance: se incluyen **todos los ingresos y egresos del mes seleccionado**, o todos los periodos si se eligió «Todos los meses». La búsqueda y el filtro de tipo del Historial no restringen el PDF. Se toma una copia de las operaciones al abrir la confirmación. Los totales se suman en céntimos y se presentan con dos decimales. Un periodo vacío produce un reporte con ceros y mensajes sin operaciones.

Las páginas adicionales repiten la identificación del reporte; las páginas que continúan la tabla repiten sus encabezados. Los textos largos se distribuyen en líneas y, si es necesario, entre páginas. La fuente Helvetica admite español, tildes y ñ; los símbolos no compatibles, como algunos emojis, se sustituyen por «?» dentro del PDF, sin modificar los registros originales.

Al terminar se abre el menú nativo para compartir. El usuario elige el destino (por ejemplo, una aplicación de archivos o correo). Las opciones de guardar disponibles dependen del sistema y de las aplicaciones instaladas; no se guarda automáticamente una copia en Descargas. Cancelar el menú no se considera un error ni elimina operaciones. La exportación no envía datos a un servidor por sí misma.

### Estructura

- `src/utils/reporte.ts`: filtra por periodo, ordena y calcula totales y gastos por categoría.
- `src/styles/estilosReporte.ts`: medidas de página, columnas, fuentes y colores del documento.
- `src/services/generarReportePdf.ts`: construye el archivo con `pdf-lib` y lo devuelve codificado en Base64 (texto que representa los bytes del PDF).
- `src/services/exportarReporte.ts`: entrega el PDF al menú nativo usando `react-native-share`, con almacenamiento interno para compartir en Android.
- `src/screens/PantallaHistorial.tsx`: confirmación de alcance, botón, estado de generación y aviso de errores. Impide exportar durante la carga, si hay error de lectura o si ya está generando otro reporte.
- `package.json` y `package-lock.json`: incorporan las dos dependencias necesarias y deben compartirse con el equipo.

### Instalación y comprobación

**Hay que recompilar la app**, porque `react-native-share` incluye código nativo. En Android, con el celular conectado y el SDK configurado:

```bash
npm install
npx react-native run-android
```

En iOS también debe actualizarse la instalación de Pods antes de compilar en macOS. Recargar Metro por sí solo no incorpora la biblioteca nativa nueva.

Se comprobó la generación y lectura de PDFs válidos con una operación de ingreso y otra de egreso, el filtrado por mes, totales, un periodo vacío y 130 operaciones con descripciones largas que requieren varias páginas. No se dejaron archivos de pruebas nuevos. La apertura del menú nativo y la inspección visual del PDF siguen pendientes en el celular.

Para probar: seleccionar un mes en Historial, pulsar «Exportar reporte PDF», confirmar y elegir un destino. Abrir el documento y comparar ingresos, egresos y resultado con Balance para el mismo periodo. Repetir con un periodo vacío y con suficientes movimientos para generar varias páginas.

Referencias técnicas: [PDF-LIB](https://pdf-lib.js.org/docs/api/classes/pdfdocument) y [React Native Share](https://react-native-share.github.io/react-native-share/docs/share-open).

## 19. Resumen y categorías presentados en tablas dentro del PDF

El resumen del periodo ahora utiliza una tabla con columnas «Concepto» y «Monto S/», con filas para ingresos, egresos y resultado. Los gastos por categoría utilizan otra tabla con «Categoría» y «Total gastado S/». Ambas tienen encabezado sombreado, bordes e importes alineados a la derecha. Si no hay egresos, la tabla indica «Sin egresos registrados» y cero. Los encabezados se repiten si una tabla continúa en otra página.

Se modificó `src/services/generarReportePdf.ts`. Se mantiene el detalle de operaciones, los cálculos, el alcance del reporte y el menú de compartir. TypeScript pasó. Para ver el formato nuevo hay que generar otro PDF; los archivos exportados previamente no cambian.

## 20. Exportación visible únicamente en «Todos»

En Historial, «Exportar reporte PDF» se muestra solo cuando está seleccionado «Todos». Al elegir «Ingresos» o «Egresos», el botón se oculta y vuelve a aparecer al regresar a «Todos». El PDF sigue incluyendo ambos tipos de operación del periodo seleccionado; no se genera un reporte específico por tipo. Cambio en `src/screens/PantallaHistorial.tsx`.
