
# Reportes

## Reporte de sumatoria de gasto de combustible por mes(Comb-KM)

(^) Reciclaje en ruta(Reciclaje)

- **RUTA** : Integer, Requerido
- **Año** : Integer, Requerido
    **Fuente** : Many2one('res.partner'), Opcional (por ejemplo, "Técnico, Randall
    Varela")

- **PLACA** : Char(10), Requerido
- **MES** : Selection(selección de meses), Opcional
- **FECHA** : Date, Requerido
- **Toneladas** : Float(6, 3), Requerido
- **HORAS EN RUTA** : Float(4, 2), Opcional
- **Otros no aprovechable** : Float(6, 2), Opcional
- **HORA PESAJE** : Time, Opcional
- **Centro de Acopio** : Char(50), Opción **----Modelo menor**

## Reporte TONELADAS RECOLECTADAS MENSUAL DE RECICLAJE POR RUTA 2024(Reciclaje)

```
Incluye una tabla de sumatoria por mes y cruzada por ruta, tiene segmentado no
aprovechable, reciclaje y total recolectado en ruta. Adicional un total general y se
presume una comparativa con el histórico mensual de años anteriores.
```

## Reciclaje por campañas(Reciclaje)

- **LUGAR (Finca u otro)** : Char(50), Opcional
- **Año** : Integer, Requerido
    **Fuente** : Many2one('res.partner'), Opcional (por ejemplo, "Técnico, Randall
    Varela")

- **Distrito** : Char(50), Opcional ------Modelo menor
- **MES** : Selection(selección de meses), Opcional
- **FECHA** : Date, Requerido
- **Toneladas** : Float(6, 3), Requerido

## ResiduosNoAprovechables(Ordinarios) y residuos Ordinarios(Ordinarios) y residuos

orgánicos(Orgánicos)

orgánicos(Orgánicos)

- **RUTA** : Char(20), Opcional
- **Año** : Integer, Requerido
    **Fuente** : Many2one('res.partner'), Opcional (por ejemplo, "Técnico, Randall
    Varela")

- **PLACA** : Char(10), Requerido
- **MES** : Selection(selección de meses), Opcional
- **FECHA** : Date, Requerido
- **Toneladas** : Float(6, 2), Requerido
- **PRODUCTO** : Char(50), Opcional------Modelo menor
- **HORA DE PESAJE** : Time, Opcional
- **tipoResiduo** Char(50), Opción(no aprovechable, ordinario, orgánico)

## Reporte de sumatoria de toneladas por mes de residuos por tipo, por ruta, incluye

sumatoria final y un total por mes, y se presume una comparativa con el histórico mensual de
años anteriores.

## TonelajeBuenosAires(Buenos aires)

- **FECHA DE FACTURACIÓN** : Date, Requerido
- **MES** : Selection(selección de meses), Opcional
    **Fuente** : Many2one('res.partner'), Opcional (por ejemplo, "Técnico, Randall
    Varela")

- **TONELADAS** : Float(6, 2), Requerido
- **Placa** : Char(10), Requerido
- **CHOFER** : Char(50), Opcional
- **NOTAS** : Text, Opcional
- **Boleta** : Char(10), Opcional

## Reporte de sumatoria de toneladas por mes de residuos de buenos aires, incluye

sumatoria final y un total por mes, y se presume una comparativa con el histórico mensual de
años anteriores.

## Órdenes de compra EBI (EBI)

- **ORDEN COMPRA** : Char(10), Requerido
    **Fuente** : Many2one('res.partner'), Opcional (por ejemplo, "Técnico, Randall
    Varela")

- **Año** : Integer, Requerido
- **FECHA DE FACTURACIÓN** : Date, Requerido
- **TONELAJE** : Float(8, 2), Requerido
- **COSTO** : Monetary, Requerido
- **NOTA** : Char(50), Opcional
- **MES** : Selection(selección de meses), Opcional

## Reporte de sumatoria de toneladas y costo por año.(EBI)

## Control de recolección de empresas privadas(Privadas)

- **Fecha** : Date, Requerido
    **Fuente** : Many2one('res.partner'), Opcional (por ejemplo, "Técnico, Randall
    Varela")

- **Año** : Integer, Requerido
- **MES** : Selection(selección de meses), Opcional
- **Peso TONELADAS** : Float(6, 2), Requerido
- **Placa** : Char(10), Opcional
- **Chofer** : Char(50), Opcional
- **N° COMPROBANTE** : Char(20), Opcional
- **MEDIO DE PAGO** : Selection(por ejemplo, 'sinpe', 'tiquetes'), Opcional
- **MONTO A CANCELAR** : Monetary, Requerido
- **MONTO CANCELADO** : Monetary, Opcional

- **MONTO CANCELADO** : Monetary, Opcional
- **DIFERENCIA** : Monetary, Opcional
- **Observaciones** : Text, Opcional
- **Peso tiquete** : Float(4, 1), Opcional
- **DESCONOCIDO** : Float(4, 1), Opcional

## Reporte de sumatoria de toneladas por mes de recolección de empresas privadas por

año, incluye sumatoria anual y un total por mes, y se presume una comparativa con el
histórico mensual de años anteriores.

(Distritales)

## Reporte de residuos por comunidad, por tipo, por día, incluye los siguientes campos

- **FECHA** : Date, Requerido
- **DÍA** : Selection(día de la semana), Opcional
- **MES** : Selection(selección de meses), Opcional
- **KG** : Integer, Opcional
- **TONELADAS** : Float(6, 2), Requerido
- **PLACA** : Char(10), Opcional
- **Comunidad** : Char(50), Opcional
- **Distrito** : Char(50), Opcional
- **N.° Boleta EBI** : Char(10), Opcional
- **FACTURA** : Char(10), Opcional

## Reporte de sumatoria de toneladas por mes por año, incluye sumatoria anual y un total

por mes, separado en basura y reciclaje(tipo)

## Reporte de sumatoria de toneladas por distrito por mes por año, incluye sumatoria

anual y un total por mes, separado en basura y reciclaje(tipo)

(ANÁLISIS)

## El reporte de "Consumo de Combustible por Placa 2024" presenta el consumo

identificado por su placa y tipo de vehículo, de enero a diciembre. Además, incluye un
resumen anual por vehículo y un promedio mensual total de consumo. Cada fila representa un
vehículo, y cada columna mensual indica la cantidad de litros consumidos, con una columna
final que muestra el total anual por vehículo. Este formato permite visualizar y comparar el
consumo de combustible de cada vehículo a lo largo del año.

## El reporte "Kilómetros Recorridos por Litro de Combustible por Vehículo 2024" muestra

el rendimiento de combustible de cada vehículo, identificado por su placa, en términos de
kilómetros por litro (KM/L) para cada mes de enero a diciembre, con un total anual y un
promedio mensual por vehículo. Cada fila representa un vehículo, y cada columna mensual
indica el rendimiento de combustible para ese periodo, permitiendo analizar la eficiencia del
consumo de combustible de cada unidad a lo largo del año.

## El reporte "Costo por Consumo de Combustible por Vehículo 2024" detalla el gasto en

combustible para cada vehículo, identificado por su placa, desglosado por mes de enero a
diciembre en colones. Cada fila representa un vehículo, mostrando el costo mensual del
combustible consumido en cada mes y un total anual al final del reporte. También incluye un
promedio mensual de gastos por vehículo y un costo promedio diario de combustible, lo que
permite evaluar el impacto financiero del consumo de combustible de cada unidad a lo largo
del año.

## El reporte "Kilómetro Recorrido Mensual por Vehículo 2024" muestra la distancia

recorrida en kilómetros por cada vehículo, identificado por su placa, de enero a diciembre, con
un total anual y un promedio mensual. Cada fila representa un vehículo, mientras que cada
columna mensual indica los kilómetros recorridos en ese periodo. La columna final muestra el
total anual de kilómetros recorridos por vehículo y el promedio mensual de kilómetros,
permitiendo analizar la actividad de cada unidad en términos de desplazamiento a lo largo del
año.

## El reporte "Kilómetro Recorrido Mensual por Ruta 2024", con un total anual por ruta

Cada fila representa una ruta específica, incluyendo una categoría especial llamada
"COMERCIAL". Las columnas mensuales indican los kilómetros recorridos en cada mes,
permitiendo observar la variación en el uso de cada ruta a lo largo del año. La última columna
muestra el total anual de kilómetros por ruta, proporcionando una visión general del
rendimiento anual de cada ruta.

(^) El reporte "Kilómetro Recorrido Mensual por Ruta 2024 por Residuo No Aprovechable"
detalle desglosado mensualmente de enero a diciembre, con un total anual y un promedio
mensual por ruta. Cada fila representa una ruta específica, incluida la categoría "COMERCIAL".
Las columnas mensuales indican los kilómetros recorridos en cada mes, mientras que las
columnas finales muestran el total anual y el promedio mensual de kilómetros por ruta,
permitiendo analizar el rendimiento y la eficiencia de cada ruta en relación con el manejo de
residuos no aprovechables.

## El reporte "Gasto de Combustible Promedios por Ruta No Aprovechable " presenta el

costo promedio de combustible para cada ruta dedicada a residuos no aprovechables,
desglosado por mes de enero a diciembre, con un total anual y un promedio mensual. Cada
fila representa una ruta específica, incluida la categoría "Comercio". Las columnas mensuales
muestran el gasto de combustible en colones, permitiendo ver las variaciones de costo a lo
largo del año. Las columnas finales muestran el gasto total anual y el promedio mensual,
proporcionando una visión completa del consumo de combustible por ruta en el manejo de
residuos no aprovechables.

## El reporte "Comparativo de Costo Promedio de Combustible Mensual" compara el costo

promedio de combustible de acuerdo con la Tabla 5 frente al gasto real mensual, detallado por
mes de enero a diciembre y con un total anual. La primera fila muestra el costo promedio de
combustible calculado para cada mes, mientras que la segunda fila muestra el gasto real
mensual. La última columna proporciona un total anual.

### (RESUMEN)

## El reporte "Disposición Final de Residuos Sólidos por año" detalla el manejo de diversos

tipos de residuos sólidos por mes, incluyendo totales y promedios. Cada columna representa
un tipo de residuo o programa de reciclaje (Orgánico, Reciclaje de El General, Campaña
Trueque Verde, etc.), así como servicios específicos como recolección municipal y distrital. Los
datos incluyen toneladas de residuos procesados en cada categoría, totales enviados a EBI y
costos de transferencia (actual EBI y sin separar). Al final, se presentan los totales y promedios
por categoría.

```
por categoría.
```

## El reporte muestra el porcentaje mensual de disposición de distintos tipos de residuos

```
(Orgánico, Reciclaje, Cárnico y Residuo no aprovechable) durante el año. Cada fila representa
un mes y muestra la proporción de cada tipo de residuo en términos porcentuales, con una
columna total que suma el 100 % por mes. La fila final "ANUAL" presenta el promedio
porcentual de cada tipo de residuo a lo largo del año, proporcionando una visión general de la
composición de los residuos procesados mensualmente y anualmente. Se puede mostrar
como un gráfico pastel o de área
