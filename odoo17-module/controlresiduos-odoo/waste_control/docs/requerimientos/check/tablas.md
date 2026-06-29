# Modelos de Datos (Entidades)

## Modelos Menores

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

## Rutas de Vehículos (`VEHICULOS-RUTAS`)

| Campo | Tipo | Requerido/Opcional |
| :--- | :--- | :--- |
| `Nº` | `Integer` | Requerido |
| `VEHÍCULO` | `Char(50)` | Opcional |
| `PLACA` | `Char(10)` | Requerido |
| `Capacidad carga` | `Float(6, 2)` | Opcional |
| `Año` | `Integer` | Opcional |
| `Observación`| `Char(100)` | Opcional |
| `Conductor` | `Many2one('res.partner')` | Opcional |

## Histórico Vehículos (`VEHICULOS-RUTAS`)

| Campo | Tipo | Requerido/Opcional |
| :--- | :--- | :--- |
| `N` | `Integer` | Requerido |
| `PLACA` | `Char(10)` | Requerido |
| `MARCA` | `Char(50)` | Opcional |
| `Conductor` | `Char(50)` | Opcional |
| `Capacidad carga`| `Float(6, 2)` | Opcional |
| `Año` | `Integer` | Opcional |
| `Estado` | `Text` | Opcional |

## Estudio de Rutas (`VEHICULOS-RUTAS`)

| Campo | Tipo | Requerido/Opcional |
| :--- | :--- | :--- |
| `N` | `Integer` | Requerido |
| `Nombre de Ruta` | `Char(100)` | Opcional |
| `KM Lineales del recorrido`| `Float(6, 2)` | Requerido |

## Residuos Cárnicos (`CARNICO`)

| Campo | Tipo | Requerido/Opcional |
| :--- | :--- | :--- |
| `Año` | `Integer` | Requerido |
| `Fuente` | `Many2one('res.partner')` | Opcional |
| `RUTA` | `Char(50)` | Opcional |
| `PLACA` | `Char(10)` | Opcional |
| `MES` | `Selection` | Opcional |
| `FECHA` | `Date` | Requerido |
| `Kilogramos`| `Float(6, 2)` | Requerido |

## Órdenes de Compra de Combustible (`Comb-KM`)

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

## Kilometrajes Recorridos (`Comb-KM`)

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

## Reciclaje en Ruta (`Reciclaje`)

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

## Reciclaje por Campañas (`Reciclaje`)

| Campo | Tipo | Requerido/Opcional |
| :--- | :--- | :--- |
| `LUGAR (Finca u otro)`| `Char(50)` | Opcional |
| `Año` | `Integer` | Requerido |
| `Fuente` | `Many2one('res.partner')` | Opcional |
| `Distrito` | `Char(50)` | Opcional |
| `MES` | `Selection` | Opcional |
| `FECHA` | `Date` | Requerido |
| `Toneladas` | `Float(6, 3)` | Requerido |

## Residuos No Aprovechables, Ordinarios y Orgánicos

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

## Tonelaje Buenos Aires (`Buenos aires`)

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

## Órdenes de Compra EBI (`EBI`)

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

## Control de Recolección de Empresas Privadas (`Privadas`)

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

## Reporte de Residuos por Comunidad (`Distritales`)

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
