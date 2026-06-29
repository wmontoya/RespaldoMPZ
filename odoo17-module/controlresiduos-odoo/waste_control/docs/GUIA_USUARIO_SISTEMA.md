# Guía Práctica: Sistema de Control de Residuos

¡Bienvenido(a)! Este manual está diseñado para ayudarle a utilizar el sistema en su trabajo diario de manera sencilla y rápida. No necesita ser un experto en tecnología para aprovechar todas estas herramientas.

---

## 1. Conociendo su Pantalla de Trabajo (Funciones de Odoo)

El sistema le ofrece diferentes maneras de consultar su información. En la esquina superior derecha siempre encontrará estos botones útiles para cambiar de vista según lo que necesite hacer:

* **Lista (<i class="fa fa-list"/>):** Es como una hoja de cálculo. Le ayuda a ver de un vistazo muchos registros agrupados en filas y columnas. Ideal para revisar el trabajo de la semana.
* **Formulario:** Es la "hoja de llenado" detallada. Se abre cuando hace clic en el botón **"Nuevo"** para ingresar un dato o al hacer clic sobre una línea en la vista de Lista para ver todos sus detalles.
* **Tabla Dinámica o Vista Pivot (<i class="fa fa-table"/>):** ¿Le gusta usar tablas dinámicas en Excel? Esta vista hace el trabajo pesado por usted dentro del mismo sistema: suma toneladas automáticamente, agrupa datos por mes, por chofer o vehículo, y le permite cruzar información con un par de clics.
* **Gráficos (<i class="fa fa-bar-chart"/>):** Transforma sus números en barras, líneas o gráficos circulares para ver el desempeño visualmente de manera inmediata.
* **Tarjetas o Kanban (<i class="fa fa-th-large"/>):** Muestra la información en cuadros o tarjetas. Es ideal para la sección de *Contactos*, sirviendo como un directorio virtual rápido.

### Búsqueda Rápida y Filtros

* En la parte superior Central verá la **Barra de Búsqueda**. Solo escriba lo que busca (como la placa de un camión, el nombre de un chofer o una fecha) y el sistema le sugerirá resultados.
* Use los botones de **Filtros** (agrupados debajo de la barra de búsqueda) para mostrar, por ejemplo, "Solo registros de Enero" o "Agrupar por Vehículo".
* Use la estrellita de **Favoritos** (junto a los filtros) para guardar su búsqueda personalizada. Si siempre revisa los datos de un camión específico, guárdelo y no tendrá que volver a buscarlo mañana.

### Zona de Notas y Comprobantes (Chatter)

¡No pierda sus papeles ni use WhatsApp para temas de trabajo! Al final de cada pantalla de llenado (Formulario), hay una sección llamada *Chatter* donde se pueden:

* **Escribir notas de registro:** Anote si hubo un choque, si la romana estaba mala, u otro incidente en la ruta. Todos los usuarios con acceso verán su nota.
* **Adjuntar archivos (<i class="fa fa-paperclip"/>):** Tome una foto con su celular o escanee los tiquetes de pesaje y las facturas de gasolina. Súbalos al sistema para tener el respaldo junto al registro numérico.
* **Ver el historial:** El sistema anota automáticamente qué usuario creó el registro y quién lo modificó por última vez.

---

## 2. ¿Dónde encuentro cada cosa en el Menú? (Navegación)

El menú principal a su izquierda organiza todo el trabajo por áreas, separando el trabajo de campo, la configuración y los análisis:

1. **Bienvenida:** El panel principal con guías y resúmenes.
2. **Comb_KM:** Todo lo relacionado con el control de los carros.
   * *Facturas:* Para registrar cada comprobante de compra de combustible.
   * *Kilometrajes recorridos:* La bitácora diaria del odómetro.
3. **Rutas de vehículos:**
   * *Histórico:* La "hoja de vida" del camión (capacidad, modelo).
   * *Rutas de vehículos:* Define qué camino tomará cada unidad.
   * *Estudio de rutas:* Distancias esperadas vs reales.
4. **Gestión de residuos:** ¡El corazón operativo del día a día!
   * Anote aquí los tiquetes que le entregan tras realizar el recorrido: Toneladas en *EBI*, recolección de *Cárnicos*, reportes comunitarios y pesajes de *Buenos Aires*.
5. **Contactos:** El directorio de recursos humanos (Choferes, Supervisores, Cuadrillas y Centros de acopio).
6. **Administración de datos:** Si necesita agregar un nuevo pueblo en la ruta, registrar un tipo de desperdicio nuevo o actualizar las "Tarifas EBI", aquí es donde debe hacerlo.
7. **Reportes:** El asistente que genera los documentos oficiales y listos para firmar o entregar a la dirección.

---

## 3. ¿Cómo registrar mi viaje? (El flujo de trabajo)

Para llevar el mejor control de su jornada y evitar errores numéricos, siga este ciclo:

1. **Al iniciar el día (Paso 1):** Vaya a *Comb_KM > Kilometrajes recorridos*. Inicie un nuevo registro (`Nuevo`). Anote la placa del vehículo, quién conduce, la hora de salida de la base y el kilometraje actual que marca la aguja. Guarde el registro.
2. **Durante la ruta (Paso 2):** Realice sus recorridos normales. Conserve consigo facturas de combustible si echó diésel, y todos los tiquetes de pesaje que le den en los vertederos o centros de reciclaje.
3. **Reportando la carga (Paso 3):** Diríjase a *Gestión de residuos* y cree los registros. Si llevó basura tradicional, vaya a la sección de *EBI* y anote el peso del tiquete. Si fue *Reciclaje*, ingréselo en su sección correspondiente.
4. **Al estacionar el carro en la base (Paso 4):** ¡Cierre su ciclo! Vuelva a su registro de *Kilometrajes recorridos* de la mañana. Edítelo para poner la hora de llegada y los kilómetros con los que apagó el vehículo.
   > **Magia del sistema:** ¡Usted no tiene que restar manualmente! El sistema tomará el Kilometraje Final menos el Inicial, calculará los KM Totales, relacionará lo gastado en combustible y procesará las horas totales que el empleado estuvo en ruta.

---

## 4. Opciones Útiles para Explotar sus Datos

### Cómo descargar a Excel

Es muy común que Jefatura o Contabilidad le pida la información en formato Excel. Tiene dos formas rapidísimas de hacerlo sin tener que copiar a mano:

1. **Exportación de Lista:** Vaya a cualquier lista de registros. Marque la casilla de selección (a la izquierda) de los viajes que desea. Arriba al centro le aparecerá el botón **✅ Acción**, haga clic ahí y seleccione **Exportar**. Podrá elegir qué columnas enviar al Excel.
2. **Exportación desde Tabla Dinámica:** Si lo que quiere es enviar un resumen (por ejemplo, el total de combustible por placa en todo el año), vaya a la vista **Pivote**, ármela como guste y toque el ícono de la nubecita con flecha hacia abajo (**Descargar xlsx**) arriba a la derecha. ¡Listo, resumen en Excel!

### Reportes Oficiales en PDF

El sistema está precargado con múltiples reportes formales (con diseño para imprimir) diseñados específicamente para el Módulo de Control de Residuos.

Para generarlos, siga estos pasos:

1. Haga clic en la viñeta de **Reportes** en el menú.
2. Seleccione el módulo (ej. *Comb_KM > Reporte de consumo de combustible por placa* o *Gestión de residuos > Reporte EBI*).
3. Se abrirá una pequeña ventana o "Asistente" que le pedirá seleccionar un **Año** en particular (y en algunos casos, un mes o placa).
4. Pulse el botón **Imprimir**.
5. Se descargará de inmediato en su computadora un archivo PDF profesional.

**Catálogo de Reportes Disponibles:**

* **De Combustible y Distancias:** Eficiencia (Km por litro), costos comparativos de combustible, registro de órdenes de compra, distancias recorridas por ruta normal o ruta de reciclaje.
* **De Residuos:** Tonelaje entregado a EBI (y su valor en dinero según las tarifas), toneladas procesadas por empresas privadas, reporte de residuos cárnicos, y esquemas de recolección distrital.

---

## 5. Roles de Equipo: ¿Qué puede hacer cada persona?

El sistema es seguro. Ocultará botones y pantallas según la función asignada a cada persona para que no haya confusiones ni borrados accidentales:

* **Técnico de Campo:** Encargado de "alimentar" el sistema ingresando los tiquetes y kilómetros diarios. Puede corregir sus propios errores de captura, pero no puede borrar ni alterar lo que registran sus compañeros.
* **Editor:** Es un asistente administrativo. Revisa que toda la documentación de los técnicos esté ingresada. Puede armar listados, exportar a Excel y verificar.
* **Jefatura / Coordinador:** Lidera el equipo. Tiene el poder de revisar cualquier número ingresado, exportar a Excel y es comúnmente quien navega en el menú de "Reportes PDF" para la toma de decisiones.
* **Auditor:** Es como un "espectador fantasma". Puede pasear por todas las pantallas, ver cualquier factura adjunta y bajar Excel, pero el sistema le bloquea todos los botones de "Nuevo", "Guardar" o "Borrar". No altera la información.
* **Apoyo Tecnológico (IT):** Administra el "detrás de escena". Si cambiaron el costo de EBI, llegaron nuevos choferes o compraron un vehículo nuevo, este usuario configurará esos catálogos base.
