
# Definición de tareas

Se marca con [x] tareas completadas, si ya esta completada y verificada marcar con la "x".

Para el proyecto en código se estará usando el ingles
Para datos y datos de prueba en `data/basic` y `data/demo`

## Requerimientos de proyecto

### Entidades

- [x] Definir la entidades menores. (`minor_models`)
  - [x] Ubicaciones (Provincia, Cantón, Distrito, Comunidad). (`locations`)
  - [x] Contactos (Choferes, Responsables, Cuadrillas, Centros de Acopio). (`contacts`)
  - [x] Métodos de pago. (`payment_methods.py`)
  - [x] Productos (Residuos). (`products.py`)
  - [x] Programas de reciclaje. (`recycle_programs.py`)
  - [x] Rutas. (`routes.py`)
  - [x] Tipos de residuos. (`types_of_waste.py`)

- [x] Entidades principales. (`core`)
  - [x] Vehículos y rutas. (`vehicles_routes`)
    - [x] Histórico de vehículos. (`vehicles_routes/historic_vehicles.py`)
    - [x] Estudio de rutas (KM lineales). (`vehicles_routes/routes_study.py`)
  - [x] Gestión de combustible. (`comb_km`)
    - [x] Órdenes de compra de combustible. (`fuel_purchase_orders.py`)
    - [x] Registro de Kilometrajes recorridos. (`kilometers_traveled.py`)
  - [x] Gestión de residuos. (`waste_management`)
    - [x] Residuos Cárnicos. (`meat_waste.py`)
    - [x] Reciclaje en Ruta. (`recycling_on_route.py`)
    - [x] Reciclaje por Campañas. (`recycling_by_campaigns.py`)
    - [x] Residuos No Aprovechables, Ordinarios y Orgánicos. (`waste.py`)
    - [x] Tonelaje Buenos Aires. (`buenos_aires_tonnages.py`)
    - [x] Órdenes de Compra EBI. (`purchase_orders_ebi.py`)
    - [x] Control de Recolección de Empresas Privadas. (`private_companies.py`)
    - [x] Reporte de Residuos por Comunidad (Distritos). (`communities_waste_reports.py`)

### Roles

> Historias de usuario:

- Como **Técnico**, quiero ingresar información y eliminar solo los registros que yo mismo creé, para mantener la integridad de mis datos.
- Como **Editor**, quiero ver y confeccionar cuadros resumen y reportes, para analizar y presentar la información de manera clara.
- Como **Jefatura/Coordinador**, quiero visualizar datos, reportes e insumos, para obtener información útil para otros proyectos y la toma de decisiones. Descargar informes y visualizar cualquier información necesaria, para gestionar y supervisar las actividades bajo mi responsabilidad.
- Como **Auditor**, quiero consultar toda la información, para poder realizar auditorías completas y garantizar la transparencia.
- Como **Informática**, quiero administrar parámetros y consultar información, para dar soporte y mantener el correcto funcionamiento del sistema.

- [x] Roles y Seguridad. (`security`)
  - [x] Técnicos. (`waste_control_technical_security.xml`)
  - [x] Editor. (`waste_control_editor_security.xml`)
  - [x] Jefatura/coordinador. (`waste_control_leadership_security.xml`)
  - [x] Auditor. (`waste_control_auditor_security.xml`)
  - [x] Informática. (`waste_control_it_security.xml`)

### Reportes

- [x] Reportes (Vistas y PDF). (`reports`)
  - [x] Reporte de Órdenes de Compra Combustible. (`fuel_purchase_orders_report.py`)
  - [x] Reporte de Tonelaje Mensual Cárnico. (`meat_waste_report.py`)
  - [x] Reporte de Gasto de Combustible por Mes. (`fuel_cost_report.py`)
  - [x] Reporte de Toneladas Reciclaje por Ruta. (`recycling_on_route_report.py`)
  - [x] Reporte de Toneladas No Aprovechables por Ruta. (`non_recyclable_waste_report.py`)
  - [x] Reporte de Control Tonelaje Buenos Aires. (`buenos_aires_tonnages_report.py`)
  - [x] Reporte de Toneladas y Costo EBI. (`purchase_orders_ebi_report.py`)
  - [x] Reporte de Recolección Empresas Privadas. (`private_companies_report.py`)
  - [x] Reporte de Toneladas Distritos. (`districts_tonnages_report.py`)
  - [x] Reporte de Consumo de Combustible por Placa. (`fuel_consumption_by_plate_report.py`)
  - [x] Reporte de Eficiencia de Combustible (KM/L). (`fuel_efficiency_report.py`)
  - [x] Reporte de Costo de Combustible por Vehículo. (`fuel_cost_report.py`)
  - [x] Reporte de Kilómetros Recorridos por Vehículo. (`km_traveled_report.py`)
  - [x] Reporte Kilómetro Recorrido Mensual por Ruta. (`km_per_route_report.py`)
  - [x] Reporte Kilómetro Recorrido Mensual por Ruta (No Aprovechable). (`km_route_non_recyclable_report.py`)
  - [x] Reporte Gasto de Combustible Promedios por Ruta No Aprovechable. (`fuel_cost_route_non_recyclable_report.py`)
  - [x] Reporte Comparativo de Costo Promedio de Combustible Mensual. (`comparative_fuel_cost_report.py`)
  - [x] Reporte Disposición Final de Residuos Sólidos. (`waste_disposition_report.py`)
  - [x] Reporte Porcentaje de cantidad de residuos mensual. (`waste_percentage_report.py`)
  - [x] Reportes de KPI de Vehículos (Consumo, KM/L, Costo). (Completo) (``)

- [x] Requerimientos Específicos (análisis de Sistema). (`waste_management`)
  - [x] Gestión especial empresas privadas (Referencia por distrito, no ruta). (`private_companies.py`)
  - [x] Manejo especial Buenos Aires. (`buenos_aires_tonnages.py`)
  - [x] Registro de recolección por viaje del mismo vehículo. (`waste.py`)
  - [x] Corrección de placas a `Many2one`. (`vehicles_routes/vehicle_routes.py`)
  - [x] Control de facturas de gasolina (selección vs manual). (`fuel_bills.py`)

## Requerimientos Adicionales (458. Información requerida para sistema de HGD)

Esta sección actualiza y complementa los requerimientos anteriores basándose en la especificación detallada del documento 458.

- [x] **Estándares de Datos y Validación** (`utils`)
  - [x] Formato numérico: Separador de decimales con punto (ej. `14.3`). (`validation_mixin.py`)
  - [x] Formato de fecha: día-mes-año. (`date_utils.py`)
  - [x] Validación estricta de campos requeridos para evitar registros incompletos. (`validation_mixin.py`)
  - [x] Auditoría de transacciones: Registro de usuario y fecha de creación/modificación. (`base_model.py`)

- [x] **Lógica de Negocio y Cálculos** (`core`)
  - [x] **Reciclaje - Ajuste de Rechazo**: Capacidad de restar residuos rechazados en centro de acopio del total de reciclaje y sumarlos a "No aprovechable". (`recycling_on_route.py`)
  - [x] **Cálculo de Jornadas**: Detección automática de exceso de jornada (Horas Extra). (`utils/date_utils.py`)
    - *Horario Diurno*: L-J 6am-3pm, V 6am-2pm.
    - *Horario Nocturno*: L-V 7pm-12am, S 6pm-11pm.
  - [x] **Cálculos Automáticos**:
    - Kilómetros recorridos (Salida - Entrada). (`kilometers_traveled.py`)
    - Diferencia de pago EBI (Calculado con tarifa variable por año). (`purchase_orders_ebi.py`)

- [x] **Gestión de Rutas y Vehículos** (`vehicles_routes`)
  - [x] **Rutas EBI**: Identificación por Distrito (sin número de ruta). (`routes_study.py`)
  - [x] **Viajes Múltiples**: Registro individual de cada viaje (si un vehículo hace >1 viaje/día). (`vehicle_routes.py`)
    - Validar que al menos uno vaya a capacidad máxima. (`vehicle_routes.py`)
    - Reporte de validación cuatrimestral de capacidad máxima. (`vehicle_routes.py`)

- [x] **Roles y Permisos (Refinamiento)** (`security`)
  - [x] Para coordinadores el rol de jefatura/coordinador (`waste_control_leadership_security.xml`)

- [x] **Nuevos Reportes / Ajustes a Reportes** (`reports`)
  - [x] **Reporte de Exceso de Jornada**: Días trabajados fuera del horario ordinario. (``)
  - [x] **Diferencias de Peso**: Comparativo Peso Planta Transferencia vs Peso Disposición Final (EBI). (``)
  - [x] **Alertas Visuales**: Resaltar (color) valores fuera de parámetros (ej. capacidad de carga). (``)

## Adicionales

Detalles de reportes, cada titulo corresponde al encabezado del pdf.
totales corresponde a sumatorias de cada columna
Promedio corresponde a la suma de los elementos entre la cantidad total de elementos (promedio anual es suma de total de cada mes dividido entre 12)

en (año seleccionado) corresponde que se sustituye segune el año seleccionado ese espacio

vista pivot se refiere a la vista deOdoo que representa los datos en fila x columna
Esto es que ademas de generar el reporte en pdf generar el reporte en la vista pivote

### 1. Reporte Tonelaje mensual cárnico del (año seleccionado)

(Vista pivote)

Todos los meses (no numérico)
Sumatoria del valor de toneladas de cada mes (valor numérico, si no hay registros su valor es 0)

```
| Mes       | Enero | Febrero | Marzo | Abrir | Mayo | Junio | Julio | Agosto | Setiembre | Octubre | Noviembre | Diciembre |
| Toneladas | 0.00  | 0.00    | 0.00  | 0.00  | 0.00 | 0.00  | 0.00  | 0.00   | 0.00      | 0.00    | 0.00      | 0.00      |

Total de toneladas anual (suma de cada mes del año): 0.00
```

### 2. Reporte Gasto de combustible por mes del (año seleccionado)

(Vista pivote)

Todos los meses (no numérico)
Sumatoria del valor de gasto de cada mes (valor numérico, si no hay registros su valor es 0)

```
| Mes   | Enero | Febrero | Marzo | Abrir | Mayo | Junio | Julio | Agosto | Setiembre | Octubre | Noviembre | Diciembre |
| Costo | 0.00  | 0.00    | 0.00  | 0.00  | 0.00 | 0.00  | 0.00  | 0.00   | 0.00      | 0.00    | 0.00      | 0.00      |

Total de costos anual: 0.00
```

### 3. Reporte TONELADAS RECOLECTADAS MENSUALMENTE DE RECICLAJE POR RUTA del (año seleccionado)

(Compuesto, solo archivo pdf)

recopila la sumas de toneladas en sus respectivas categorías
lista las rutas existentes y los que no entran en reciclables por rutas ni en no aprovechables entran en otros
otros (son depósitos por parte de los usuarios)

Sumatoria del valor de gasto de cada mes (valor numérico, si no hay registros su valor es 0)

```
| Rutas | Enero | Febrero | Marzo | Abrir | Mayo | Junio | Julio | Agosto | Setiembre | Octubre | Noviembre | Diciembre | Anual |
| (nombre de ruta ...)   | 0.00  | 0.00    | 0.00  | 0.00  | 0.00 | 0.00  | 0.00  | 0.00   | 0.00      | 0.00    | 0.00      | 0.00      | 0.00  |

| Otros | 0.00  | 0.00    | 0.00  | 0.00  | 0.00 | 0.00  | 0.00  | 0.00   | 0.00      | 0.00    | 0.00      | 0.00      | 0.00  |
| no aprovechables | 0.00  | 0.00    | 0.00  | 0.00  | 0.00 | 0.00  | 0.00  | 0.00   | 0.00      | 0.00    | 0.00      | 0.00      | 0.00  |
| total recolectado por mes | 0.00  | 0.00    | 0.00  | 0.00  | 0.00 | 0.00  | 0.00  | 0.00   | 0.00      | 0.00    | 0.00      | 0.00      | 0.00  |
| total reciclado | 0.00  | 0.00    | 0.00  | 0.00  | 0.00 | 0.00  | 0.00  | 0.00   | 0.00      | 0.00    | 0.00      | 0.00      | 0.00  |

Promedio de toneladas mensual (suma de total recolectado por mes dividido entre 12): 0.0000
```

total recolectado por mes: suma de la columna
total reciclado: (total recolectado por mes - no aprovechables) o suma de la columna excluyendo no aprovechables

### 4. Reporte Toneladas mensuales de residuos no aprovechables por ruta en (año seleccionado)

Sumatoria del valor de gasto de cada mes (valor numérico, si no hay registros su valor es 0)

```
| Rutas | Enero | Febrero | Marzo | Abrir | Mayo | Junio | Julio | Agosto | Setiembre | Octubre | Noviembre | Diciembre | Anual |
| (nombre de ruta ...)   | 0.00  | 0.00    | 0.00  | 0.00  | 0.00 | 0.00  | 0.00  | 0.00   | 0.00      | 0.00    | 0.00      | 0.00      | 0.00  |

| Comercial | 0.00  | 0.00    | 0.00  | 0.00  | 0.00 | 0.00  | 0.00  | 0.00   | 0.00      | 0.00    | 0.00      | 0.00      | 0.00  |
| Otros | 0.00  | 0.00    | 0.00  | 0.00  | 0.00 | 0.00  | 0.00  | 0.00   | 0.00      | 0.00    | 0.00      | 0.00      | 0.00  |
| Reciclaje | 0.00  | 0.00    | 0.00  | 0.00  | 0.00 | 0.00  | 0.00  | 0.00   | 0.00      | 0.00    | 0.00      | 0.00      | 0.00  |
| orgánico | 0.00  | 0.00    | 0.00  | 0.00  | 0.00 | 0.00  | 0.00  | 0.00   | 0.00      | 0.00    | 0.00      | 0.00      | 0.00  |
| total | 0.00  | 0.00    | 0.00  | 0.00  | 0.00 | 0.00  | 0.00  | 0.00   | 0.00      | 0.00    | 0.00      | 0.00      | 0.00  |

Promedio de toneladas mensual (suma de total recolectado por mes dividido entre 12): 0.0000
```

total: suma de la columna
otros: entregados por usuarios
reciclaje: devuelto como no aprovechables
orgánico: categoria de orgánicos

### 5. Control de tonelaje de Buenos Aires en (año seleccionado)

(Vista pivote)

Sumatoria del valor de gasto de cada mes (valor numérico, si no hay registros su valor es 0)

```
| Mes       | Enero | Febrero | Marzo | Abrir | Mayo | Junio | Julio | Agosto | Setiembre | Octubre | Noviembre | Diciembre |
| Toneladas | 0.00  | 0.00    | 0.00  | 0.00  | 0.00 | 0.00  | 0.00  | 0.00   | 0.00      | 0.00    | 0.00      | 0.00      |

Promedio de toneladas anual: 0.000
```

### 6. Reporte de sumatoria de tonaladas del EBI en (año seleccionado)

(Vista pivote)

```
|             | Toneladas | Costo |
| total anual | 0.000     | 0.00  |
```

### 7. Reporte de Control de recolección de empresas privadas en (año seleccionado)

Reporte de sumatoria de toneladas por mes de recolección de empresas privadas por
año, incluye sumatoria annual y un total por mes, y se presume una comparativa con el
histórico mensual de años anteriores

(Vista pivote)

```
|           | Enero | Febrero | Marzo | Abrir | Mayo | Junio | Julio | Agosto | Setiembre | Octubre | Noviembre | Diciembre |
| (cada monto del mes ... ) | 0.00  | 0.00    | 0.00  | 0.00  | 0.00 | 0.00  | 0.00  | 0.00   | 0.00      | 0.00    | 0.00      | 0.00        |
| ( monto n ) | 0.00  | 0.00    | 0.00  | 0.00  | 0.00 | 0.00  | 0.00  | 0.00   | 0.00      | 0.00    | 0.00      | 0.00        |
| total mensual | 0.00  | 0.00    | 0.00  | 0.00  | 0.00 | 0.00  | 0.00  | 0.00   | 0.00      | 0.00    | 0.00      | 0.00        |

 total Anual: 0.00
```

### 8. Toneladas distritales en (año seleccionado)

Reporte de sumatoria de toneladas por mes por año, incluye sumatoria annual y un total
por mes, separado en basura y reciclaje(tipo)

```
| Tipo de residuo | Enero | Febrero | Marzo | Abrir | Mayo | Junio | Julio | Agosto | Setiembre | Octubre | Noviembre | Diciembre | total Anual |
| (listado de cada tipo de residuo ...)   | 0.00  | 0.00    | 0.00  | 0.00  | 0.00 | 0.00  | 0.00  | 0.00   | 0.00      | 0.00    | 0.00      | 0.00      | 0.00  |
| total | 0.00  | 0.00    | 0.00  | 0.00  | 0.00 | 0.00  | 0.00  | 0.00   | 0.00      | 0.00    | 0.00      | 0.00      | 0.00  |
```

### 9. Reporte de residuos por comunidad (Distritales) (año seleccionado)

(solo vista pivote)

los valores opcionales se muestran como vacíos

por tipo, por dia, incluye los siguientes campos:

- FECHA: Date, Requerido
- DÍA: Selection(día de la semana), Opcional
- MES: Selection(selección de meses), Opcional
- KG: Integer, Opcional
- TONELADAS: Float(6, 2), Requerido
- PLACA: Char(10), Opcional
- Comunidad: Char(50), Opcional
- Distrito: Char(50), Opcional
- N.º Boleta EBI: Char(10), Opcional
- FACTURA: Char(10), Opcional

```
tabla con los respectivos valores de cada campo
```

### Complejos

todos estos solo en la seccion de reportes par un pdf

#### 10. Reporte de sumatoria de toneladas por distrito por mes por año

incluye sumatoria

annual y un total por mes, separado en basura y reciclaje(tipo)

#### 11. Reporte de Consumo de Combustible por Placa en (año seleccionado)

identificado por su placa y tipo de vehículo, de enero a diciembre. Además, incluye un
resumen anual por vehículo y un promedio mensual total de consumo. Cada fila representa un
vehículo, y cada columna mensual indica la cantidad de litros consumidos, con una columna
final que muestra el total anual por vehículo. Este formato permite visualizar y comparar el
consumo de combustible de cada vehículo a lo largo del año.

```
tabla 1

promedio mensual de litros: 0.000
```

#### 12. Reporte Kilómetros Recorridos por Litro de Combustible por Vehículo (año seleccionado)

el rendimiento de combustible de cada vehículo, identificado por su placa, en términos de
kilómetros por litro (KM/L) para cada mes de enero a diciembre, con un total anual y un
promedio mensual por vehículo. Cada fila representa un vehículo, y cada columna mensual
indica el rendimiento de combustible para ese periodo, permitiendo analizar la eficiencia del
consumo de combustible de cada unidad a lo largo del año

```
tabla 2
```

#### 13. Reporte Costo por Consumo de Combustible por Vehículo (año seleccionado)

combustible para cada vehículo, identificado por su placa, desglosado por mes de enero a
diciembre en colones. Cada fila representa un vehículo, mostrando el costo mensual del
combustible consumido en cada mes y un total anual al final del reporte. También incluye un
promedio mensual de gastos por vehículo y un costo promedio diario de combustible, lo que
permite evaluar el impacto financiero del consumo de combustible de cada unidad a lo largo
del año

```
tabla 3

promedio de gasto mensual de combustible: 0.00
promedio de gasto diario de combustible: 0.00
```

#### 14. Reporte Kilómetro Recorrido Mensual por Vehículo (año seleccionado)

muestra la distancia
recorrida en kilómetros por cada vehículo, identificado por su placa, de enero a diciembre, con
un total anual y un promedio mensual. Cada fila representa un vehículo, mientras que cada
columna mensual indica los kilómetros recorridos en ese periodo. La columna final muestra el
total anual de kilómetros recorridos por vehículo y el promedio mensual de kilómetros,
permitiendo analizar la actividad de cada unidad en términos de desplazamiento a lo largo del
año.

```
tabla 4
```

#### 15. Reporte Kilómetro Recorrido Mensual por Ruta (año seleccionado) | (Completo)

 con un total anual por ruta.
Cada fila representa una ruta específica, incluyendo una categoría especial llamada
"COMERCIAL". Las columnas mensuales indican los kilómetros recorridos en cada mes,
permitiendo observar la variación en el uso de cada ruta a lo largo del año. La última columna
muestra el total anual de kilómetros por ruta, proporcionando una visión general del
rendimiento anual de cada ruta.

```
tabla 5
```

#### 16. Reporte Kilómetro Recorrido Mensual por Ruta (año seleccionado) por Residuo No Aprovechable | (Completo)

detalle desglosado mensualmente de enero a diciembre, con un total anual y un promedio
mensual por ruta. Cada fila representa una ruta específica, incluida la categoría "COMERCIAL".
Las columnas mensuales indican los kilómetros recorridos en cada mes, mientras que las
columnas finales muestran el total anual y el promedio mensual de kilómetros por ruta,
permitiendo analizar el rendimiento y la eficiencia de cada ruta en relación con el manejo de
residuos no aprovechables.

```
tabla 6
```

#### 17. Reporte Gasto de Combustible Promedios por Ruta No Aprovechable (año seleccionado) | (Completo)

presenta el costo promedio de combustible para cada ruta dedicada a residuos no aprovechables,
desglosado por mes de enero a diciembre, con un total anual y un promedio mensual. Cada
fila representa una ruta específica, incluida la categoría "Comercio". Las columnas mensuales
muestran el gasto de combustible en colones, permitiendo ver las variaciones de costo a lo
largo del año. Las columnas finales muestran el gasto total anual y el promedio mensual,
proporcionando una visión completa del consumo de combustible por ruta en el manejo de
residuos no aprovechables.

#### 18. Reporte Comparativo de Costo Promedio de Combustible Mensual (año seleccionado) | (Completo)

compara el costo promedio de combustible de acuerdo con la Tabla 5 frente al gasto real mensual, detallado por
mes de enero a diciembre y con un total anual. La primera fila muestra el costo promedio de
combustible calculado para cada mes, mientras que la segunda fila muestra el gasto real
mensual. La última columna proporciona un total annual.

#### 19. Reporte Disposición Final de Residuos Sólidos por (año seleccionado) | (Completo)

detalla el manejo de diversos tipos de residuos sólidos por mes,  incluyendo totales y promedios. Cada columna representa
un tipo de residuo o programa de reciclaje (Orgánico, Reciclaje de El General, Campaña
Trueque Verde, etc.), así como servicios específicos como recolección municipal y distrital. Los
datos incluyen toneladas de residuos procesados en cada categoría, totales enviados a EBI y
costos de transferencia (actual EBI y sin separar). Al final, se presentan los totales y promedios
por categoría.

#### 20. Reporte  Porcentaje de cantidad de residuos mensual en (año seleccionado) | (Completo)

muestra el porcentaje mensual de disposición de distintos tipos de residuos (Orgánico, Reciclaje, Cárnico y Residuo no aprovechable) durante el año. Cada fila representa
un mes y muestra la proporción de cada tipo de residuo en términos porcentuales, con una
columna total que suma el 100 % por mes. La fila final "ANUAL" presenta el promedio
porcentual de cada tipo de residuo a lo largo del año, proporcionando una visión general de la
composición de los residuos procesados mensualmente y anualmente. Se puede mostrar
como un gráfico pastel o de area

```
| mes       | (cada tipo de residuo ...) |
| Enero     | 0% |
| Febrero   | 0% |
| Marzo     | 0% |
| Abrir     | 0% |
| Mayo      | 0% |
| Junio     | 0% |
| Julio     | 0% |
| Agosto    | 0% |
| Setiembre | 0% |
| Octubre   | 0% |
| Noviembre | 0% |
| Diciembre | 0% |
| Anual     | 0% |
```
