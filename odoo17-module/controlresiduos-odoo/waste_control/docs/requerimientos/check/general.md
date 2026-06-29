# Análisis de Sistema HGDATOS

## Solución Propuesta

Se propone realizar un módulo en Odoo con vistas nativas para los mantenimientos y trabajar en la reportes y gráficos de resumen. Se agregarán ventanas personalizadas para facilitar la captura de información y se gestionarán permisos, dominios y ámbitos para proteger los datos.

---

## Roles de Usuario

* **Técnicos**: Ingresan información y solo pueden eliminar la información que ellos mismos han creado.
* **Editor**: Puede ver y confeccionar cuadros de resumen y reportes.
* **Jefatura**: Tiene acceso de visualización para obtener datos, reportes e insumos para otros proyectos.
* **Auditor**: Tiene permisos para consultar toda la información.
* **Informática**: Administra parámetros y tiene acceso de consulta.

---

## Notas Generales

* Corrección de placas a `many2one`.
* Crear un control de facturas de gasolina para seleccionar en lugar de ingresar a mano.
* Crear un control de rutas, posiblemente `many2many`.
* Se necesita clarificación sobre la tabla "ORDENES DE COMPRA COMBUSTIBLE 2024".

---

## Modelos de Datos (Entidades)

### Modelos Menores

Estos son modelos más pequeños a tener en cuenta:

* Provincia
* Cantón
* Distrito
* Comunidad
* Medio de pago
* Chofer
* Responsable
* TipoResiduo
* CentroAcopio
* Cuadrilla: Grupo de funcionarios involucrado.
* Programa De reciclaje
* Ruta
* Producto-Residuos no aprovechables

### Rutas de Vehículos (`VEHICULOS-RUTAS`)

| Campo | Tipo | Requerido/Opcional |
| :--- | :--- | :--- |
| `Nº` | `Integer` | Requerido |
| `VEHÍCULO` | `Char(50)` | Opcional |
| `PLACA` | `Char(10)` | Requerido |
| `Capacidad carga` | `Float(6, 2)` | Opcional |
| `Año` | `Integer` | Opcional |
| `Observación`| `Char(100)` | Opcional |
| `Conductor` | `Many2one('res.partner')` | Opcional |

### Histórico Vehículos (`VEHICULOS-RUTAS`)

| Campo | Tipo | Requerido/Opcional |
| :--- | :--- | :--- |
| `N` | `Integer` | Requerido |
| `PLACA` | `Char(10)` | Requerido |
| `MARCA` | `Char(50)` | Opcional |
| `Conductor` | `Char(50)` | Opcional |
| `Capacidad carga`| `Float(6, 2)` | Opcional |
| `Año` | `Integer` | Opcional |
| `Estado` | `Text` | Opcional |

### Estudio de Rutas (`VEHICULOS-RUTAS`)

| Campo | Tipo | Requerido/Opcional |
| :--- | :--- | :--- |
| `N` | `Integer` | Requerido |
| `Nombre de Ruta` | `Char(100)` | Opcional |
| `KM Lineales del recorrido`| `Float(6, 2)` | Requerido |

### Residuos Cárnicos (`CARNICO`)

| Campo | Tipo | Requerido/Opcional |
| :--- | :--- | :--- |
| `Año` | `Integer` | Requerido |
| `Fuente` | `Many2one('res.partner')` | Opcional |
| `RUTA` | `Char(50)` | Opcional |
| `PLACA` | `Char(10)` | Opcional |
| `MES` | `Selection` | Opcional |
| `FECHA` | `Date` | Requerido |
| `Kilogramos`| `Float(6, 2)` | Requerido |

### Órdenes de Compra de Combustible (`Comb-KM`)

*Nota: Se sugiere separar el control de facturas.*

| Campo | Tipo | Requerido/Opcional |
| :--- | :--- | :--- |
| `Año` | `Integer` | Requerido |
| `N Factura` | `Char(10)` | Requerido |
| `Fuente` | `Many2one('res.partner')` | Opcional |
| `PLACA` | `Char(10)` | Opcional |
| `MES` | `Selection` | Opcional |
| `FECHA` | `Date` | Requerido |
| `LITROS` | `Float(10, 3)` | Requerido |
| `MONTO` | `Monetary` | Requerido |
| `NOMBRE SOLICITANTE`| `Many2one('res.partner')`| Opcional |
| `N OC` | `Char(10)` | Opcional |
| `CUPON` | `Char(10)` | Opcional |

### Kilometrajes Recorridos (`Comb-KM`)

*Nota: Se debe generar un registro de rutas.*

| Campo | Tipo | Requerido/Opcional |
| :--- | :--- | :--- |
| `PLACA` | `Char(10)` | Requerido |
| `Fuente` | `Many2one('res.partner')` | Opcional |
| `MES` | `Selection` | Opcional |
| `FECHA` | `Date` | Opcional |
| `SALIDA KM` | `Integer` | Opcional |
| `ENTRADA KM`| `Integer` | Opcional |
| `TOTAL (KM)`| `Integer` | Opcional |
| `RESIDUO` | `Char(50)` | Opcional |
| `RUTA` | `Char(50)` | Opcional |
| `HORAS EN RUTA`| `Float(4, 2)` | Opcional |
| `CUADRILLA` | `Char(20)` | Opcional |
| `CHOFER` | `Char(50)` | Opcional |
| `Observaciones`| `Text` | Opcional |

### Reciclaje en Ruta (`Reciclaje`)

| Campo | Tipo | Requerido/Opcional |
| :--- | :--- | :--- |
| `RUTA` | `Integer` | Requerido |
| `Año` | `Integer` | Requerido |
| `Fuente` | `Many2one('res.partner')` | Opcional |
| `PLACA` | `Char(10)` | Requerido |
| `MES` | `Selection` | Opcional |
| `FECHA` | `Date` | Requerido |
| `Toneladas` | `Float(6, 3)` | Requerido |
| `HORAS EN RUTA` | `Float(4, 2)` | Opcional |
| `Otros no aprovechable`| `Float(6, 2)` | Opcional |
| `HORA PESAJE`| `Time` | Opcional |
| `Centro de Acopio` | `Char(50)` | Opcional |

### Reciclaje por Campañas (`Reciclaje`)

| Campo | Tipo | Requerido/Opcional |
| :--- | :--- | :--- |
| `LUGAR (Finca u otro)`| `Char(50)` | Opcional |
| `Año` | `Integer` | Requerido |
| `Fuente` | `Many2one('res.partner')` | Opcional |
| `Distrito` | `Char(50)` | Opcional |
| `MES` | `Selection` | Opcional |
| `FECHA` | `Date` | Requerido |
| `Toneladas` | `Float(6, 3)` | Requerido |

### Residuos No Aprovechables, Ordinarios y Orgánicos

| Campo | Tipo | Requerido/Opcional |
| :--- | :--- | :--- |
| `RUTA` | `Char(20)` | Opcional |
| `Año` | `Integer` | Requerido |
| `Fuente` | `Many2one('res.partner')` | Opcional |
| `PLACA` | `Char(10)` | Requerido |
| `MES` | `Selection` | Opcional |
| `FECHA` | `Date` | Requerido |
| `Toneladas` | `Float(6, 2)` | Requerido |
| `PRODUCTO` | `Char(50)` | Opcional |
| `HORA DE PESAJE`| `Time` | Opcional |
| `tipoResiduo`| `Char(50)` | Opcional (no aprovechable, ordinario, orgánico) |

### Tonelaje Buenos Aires (`Buenos aires`)

| Campo | Tipo | Requerido/Opcional |
| :--- | :--- | :--- |
| `FECHA DE FACTURACIÓN`| `Date` | Requerido |
| `MES` | `Selection` | Opcional |
| `Fuente` | `Many2one('res.partner')` | Opcional |
| `TONELADAS` | `Float(6, 2)` | Requerido |
| `Placa` | `Char(10)` | Requerido |
| `CHOFER` | `Char(50)` | Opcional |
| `NOTAS` | `Text` | Opcional |
| `Boleta` | `Char(10)` | Opcional |

### Órdenes de Compra EBI (`EBI`)

| Campo | Tipo | Requerido/Opcional |
| :--- | :--- | :--- |
| `ORDEN COMPRA`| `Char(10)` | Requerido |
| `Fuente` | `Many2one('res.partner')` | Opcional |
| `Año` | `Integer` | Requerido |
| `FECHA DE FACTURACION`| `Date` | Requerido |
| `TONELAJE` | `Float(8, 2)` | Requerido |
| `COSTO` | `Monetary` | Requerido |
| `NOTA` | `Char(50)` | Opcional |
| `MES` | `Selection` | Opcional |

### Control de Recolección de Empresas Privadas (`Privadas`)

| Campo | Tipo | Requerido/Opcional |
| :--- | :--- | :--- |
| `Fecha` | `Date` | Requerido |
| `Fuente` | `Many2one('res.partner')` | Opcional |
| `Año` | `Integer` | Requerido |
| `MES` | `Selection` | Opcional |
| `Peso TONELADAS`| `Float(6, 2)` | Requerido |
| `Placa` | `Char(10)` | Opcional |
| `Chofer` | `Char(50)` | Opcional |
| `N COMPROBANTE`| `Char(20)` | Opcional |
| `MEDIO DE PAGO`| `Selection` | Opcional ('sinpe', 'tiquetes') |
| `MONTO A CANCELAR`| `Monetary` | Requerido |
| `MONTO CANCELADO`| `Monetary` | Opcional |
| `DIFERENCIA` | `Monetary` | Opcional |
| `Observaciones`| `Text` | Opcional |
| `Peso tiquete`| `Float(4, 1)` | Opcional |

### Reporte de Residuos por Comunidad (`Distritales`)

| Campo | Tipo | Requerido/Opcional |
| :--- | :--- | :--- |
| `FECHA` | `Date` | Requerido |
| `DÍA` | `Selection` | Opcional |
| `MES` | `Selection` | Opcional |
| `KG` | `Integer` | Opcional |
| `TONELADAS` | `Float(6, 2)` | Requerido |
| `PLACA` | `Char(10)` | Opcional |
| `Comunidad` | `Char(50)` | Opcional |
| `Distrito` | `Char(50)` | Opcional |
| `N. Boleta EBI`| `Char(10)` | Opcional |
| `FACTURA` | `Char(10)` | Opcional |

---

## Reportes

### Reporte: Órdenes de Compra Combustible 2024

Se requiere un control para las órdenes de compra de combustible.

| N° OC | PERIODO DESDE | PERIODO HASTA | DOC | MONTO | Gasto actual | SALDO |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| | | | | | | |

### Reporte: Tonelaje Mensual Cárnico 2024

Se necesita una sumatoria del tonelaje de residuos cárnicos mensual por año.

| ENERO | FEBRERO | MARZO | ABRIL | MAYO | JUNIO | JULIO | AGOSTO | SETIEMBRE | OCTUBRE | NOVIEMBRE | DICIEMBRE | ANUAL |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| TONELADAS | TONELADAS | TONELADAS | TONELADAS | TONELADAS | TONELADAS | TONELADAS | TONELADAS | TONELADAS | TONELADAS | TONELADAS | TONELADAS | TONELADAS |
| 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | |

### Reporte: Sumatoria de Gasto de Combustible por Mes

Reporte mensual del gasto real en combustible.

| ENERO | FEBRERO | MARZO | ABRIL | MAYO | JUNIO | JULIO | AGOSTO | SEPTIEMBRE | OCTUBRE | NOVIEMBRE | DICIEMBRE | ANUAL |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| GASTO REAL | GASTO | GASTO | GASTO | GASTO | GASTO | GASTO | GASTO | GASTO | GASTO | GASTO | GASTO | |
| SUMAR SI | SUMAR SI | SUMAR SI | SUMAR SI | SUMAR SI | SUMAR SI | SUMAR SI | SUMAR SI | SUMAR SI | SUMAR SI | SUMAR SI | SUMAR SI | |

### Reporte: Toneladas Recolectadas Mensual de Reciclaje por Ruta 2024

Tabla de sumatoria por mes, cruzada por ruta. Segmenta entre no aprovechable, reciclaje y total. Incluye un total general y una comparativa con históricos.

| RUTA | ENERO | FEBRERO | MARZO | ABRIL | MAYO | JUNIO | JULIO | ... | ANUAL |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TONELADAS** | | | | | | | | | |
| Ruta 1 | 26.505 | 18.34 | 13.33 | ... | ... | ... | ... | ... | 904.59 |
| Ruta 2 | 17.315 | 23.795 | 7.585 | ... | ... | ... | ... | ... | 581.687 |
| ... | ... | ... | ... | ... | ... | ... | ... | ... | ... |
| **No Aprovechable** | 17.3 | 13.5 | 15 | ... | ... | ... | ... | ... | 63.28 |
| **Total Recolectado**| 107.5 | 39.30 | 84.65 | ... | ... | ... | ... | ... | 6111.61 |
| **Total Reciclaje** | 90.59 | 57.42 | 74.30 | ... | ... | ... | ... | ... | 6048.23 |
| **Promedio Mensual**| | | | | | | | | 504.019 |

### Reporte: Toneladas Recolectadas Mensual de Residuos No Aprovechables por Ruta 2024

Sumatoria de toneladas por mes por tipo de residuo y por ruta. Incluye sumatoria final y comparativa con históricos.

| RUTA | ENERO | FEBRERO | MARZO | ABRIL | MAYO | ... | ANUAL |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 3 | 207.18 | 188.14 | 144.43 | 200.01 | 253.41 | ... | 1876.22 |
| 4 | 116.53 | 80.00 | 93.71 | 152.12 | 128.22 | ... | 1053.21 |
| 5 | 50 | 50.02 | 64.77 | 96.27 | 55.73 | ... | 688.41 |
| COMERCIAL| 236.52 | 232.74 | 105.7 | 156.47 | 215.88 | ... | 1907.36 |
| OTROS | 0.26 | 5.84 | 0.56 | 6.58 | 7.21 | ... | 60.3 |
| RECICLAJE| 17.3 | 15 | 13.5 | 17.48 | 0 | ... | 63.28 |
| ORGANICO| 27.01 | 27.95 | 23.84 | 29.07 | 4.82 | ... | 113.59 |
| **TOTAL** | **1219.98**| **1026.63**| **882.38** | **1109.48**| **1076.89**| **...** | **10979.96**|
| **Promedio**| **1044.715**| | | | | **...** | **1374.73**|

### Reporte: Control Tonelaje Municipalidad de Buenos Aires 2024

Reporte de sumatoria de toneladas por mes de residuos de Buenos Aires, con sumatoria final y comparativa histórica.

| | ENERO | FEBRERO | MARZO | ABRIL | MAYO | ... | ANUAL |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **TONELADAS**| 367.53 | 328.21 | 293.54 | 346.06 | 361.22 | ... | |
| **TOTAL** | **367.53**| **328.21**| **293.54**| **346.06**| **361.22**| **...** | **2843.74** |
| **Promedio Mensual**| | | | | | | **236.98** |

### Reporte: Toneladas y Costo EBI por Año

Sumatoria de toneladas y costo total por año.

| AÑO | TONELADAS | COSTO |
| :--- | :--- | :--- |
| **2024** | 11607.07 | 377,063,909.67 |

### Reporte: Control de Recolección de Empresas Privadas 2024

Sumatoria de toneladas mensuales de recolección a empresas privadas por año, con total anual y comparativa histórica.

| | ENERO | FEBRERO | MARZO | ABRIL | MAYO | ... | ANUAL |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **MONTO** | 3,791,000 | ... | ... | ... | ... | ... | ... |

### Reporte: Toneladas Recolectadas Mensual Distritales 2024

Sumatoria de toneladas por mes por año, separado por tipo [basura y reciclaje].

| RESIDUO | ENERO | FEBRERO | MARZO | ABRIL | MAYO | ... | ANUAL |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **BASURA** | 344.58 | 330.64 | 299.87 | 391.02 | 408.36 | ... | 2996.25 |
| **RECICLAJE**| 51.711 | 36.695 | 30.06 | 35.04 | 32.195 | ... | 278.666 |
| **TOTAL** | **396.291**| **367.335**| **329.93**| **426.06**| **440.555**| **...** | **3274.916**|

### Reportes Adicionales de Análisis (Resumen)

1. **Consumo de Litros Combustible por Placa 2024**: Consumo mensual por vehículo, con total anual y promedio.
2. **Kilómetros Recorridos por Litro de Combustible por Vehículo 2024**: Rendimiento (KM/L) mensual por vehículo.
3. **Costo por Consumo de Combustible por Vehículo 2024**: Gasto mensual en colones por vehículo.
4. **Kilómetro Recorrido Mensual por Vehículo 2024**: Distancia total recorrida por vehículo cada mes.
5. **Kilómetro Recorrido Mensual por Ruta 2024**: Distancia recorrida por cada ruta, incluyendo "COMERCIAL".
6. **Kilómetro Recorrido Mensual por Ruta 2024 por Residuo No Aprovechable**: Detalle de KM por ruta para este tipo de residuo.
7. **Gasto de Combustible Promedios por Ruta No Aprovechable**: Costo promedio de combustible para rutas de no aprovechables.
8. **Comparativo de Costo Promedio de Combustible Mensual**: Compara el costo promedio calculado vs. el gasto real mensual.
9. **Disposición Final de Residuos Sólidos por año**: Detalle por tipo de residuo y programa, incluyendo costos y totales enviados a EBI.

### Reporte: Porcentaje Mensual de Disposición de Residuos

Muestra la proporción de cada tipo de residuo mensualmente. Puede ser un gráfico pastel o de área.

| MES | Orgánico | Cárnico | Reciclaje | Residuo no Aprov. |
| :--- | :--- | :--- | :--- | :--- |
| Enero | 19% | 6% | 0% | 75% |
| Febrero | 19% | 6% | 0% | 75% |
| Marzo | 21% | 6% | 0% | 73% |
| Abril | 19% | 6% | 0% | 75% |
| Mayo | 15% | 6% | 0% | 78% |
| Junio | 0% | 67% | 0% | 33% |
| Julio | 0% | 86% | 0% | 14% |
| ... | ... | ... | ... | ... |
| **ANUAL** | **7%** | **44%** | **0%** | **50%** |
