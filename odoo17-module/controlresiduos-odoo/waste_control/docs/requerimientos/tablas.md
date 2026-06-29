# Funcionalidades Realizadas del proyecto

EL proyecto se clasifica en módulos (Subgrupos del proyecto principal)
toda entidad hereda de Base_model

- campo: active / activo (indica su disponibilidad, de lo contrario esta archivado)

- funciones generales
Los campos requeridos se representan con (R) y los únicos con (único)

Los campos que terminan en id son relaciones
[ valores que se deben ingresar,
Relaciones con otros registros id,
Campos que se auto calcula]
Total de entidades 27: 13 menores 14 principales

## Módulo de entidades menores

En común tienen el campo: nombre (único, R) / name algunas tiene un campo de descripción (opcional) / description | details

### Ubicaciones

1. provincias / provinces San Jose
2. cantones / cantons Perez Zeledon
3. distritos / districts
4. comunidades / communities
Relacionados en el orden jerárquico anterior

### Contactos

- centros de recolección / collection centers

- conductores / drivers

- squads / cuadrillas

- supervisores / supervisors

### Estos campos esta directamente relacionados con res.partner para sincronizar con los usuarios deOdoo General

- método de pago / payment methods *sinpe, tiquete, tarjeta, efectivo

- productos / products

- programa de reciclaje / recycle programs

- rutas / routes

- tipos de residuos / types of waste*por defecto: no aprovechable, ordinario, orgánico

## Módulos principales / core

### 1 Módulo vehículos

- rutas

- histórico vehículos / historic vehicles h_vehículo
[numero (R), numero placa (R), marca, año, capacidad de carga, estado (texto), conductor id]

- estudio de rutas / routes study
[numero (R), kilómetros lineales de ruta (R),
ruta id]

- rutas de vehículos / vehicle routes
[numero (R), año, capacidad de carga, observaciones,
conductor id, h_vehículo id, ruta id]

### 2 Módulo Comb

- km factura / bills *nota: entidad nueva a petición, de separar orden de compra
[numero factura (único, R), fecha (R), monto (R),
 moneda id]

- orden de compra de combustible / fuel parchase orders
[fecha (R), litros (R), monto (R), numero oc, cupón,
factura id, solicitante id, h_vehículo id, moneda id]

- Kilometrajes recorridos / kilometers traveled
[fecha, km salida, km entrada, Km total, residuos (texto), horas en ruta, observaciones,
conductor id, cuadrilla id, ruta id, h_vehículo id,
mes]

### 3 Modulo de registro de residuos

reciclaje

- reciclaje por campañas / recycling by campaigns
[lugar, fecha (R), toneladas (R),
distrito id, programa reciclaje id, h_vehículo,
mes, año]

- reciclaje en ruta / recycling on route
[fecha (R), toneladas (R), otros no aprovechables (texto), horas en ruta, hora pesaje,
ruta id, h_vehículo id, centro de recolección id,
mes, año]
otros

- tonelajes buenos aires / buenos aires tonnages
[fecha facturación (R), toneladas (R), notas, tiquete,
h_vehicle id (R), driver id,
mes]

- residuos cárnicos / meat waste
[fecha (R), kilogramos (R),
 ruta id, h_vehicle id,
mes, año]

- compañias privadas / private companies
[fecha (R), peso toneladas (R), numero de comprobante (R), monto a pagar (R), monto pagado (R), diferencia, observaciones, peso tiquete, desconocido, h_vehicle id, conductor id, método de pago id, moneda id,
mes, año]

- orden de compra EBI / purchase order EBI
[fecha (R), orden de compra (R), fecha (R), tonelaje (R), costo, notas,
moneda id,
mes, año]

- residuos / waste *no aprovechable, ordinario, orgánico
[fecha (R), toneladas (R), hora pesaje,
producto id, tipo de residuo id, ruta id, h_vehículo id,
mes, año]

________________________________________

- reportes de residuos de comunidades / communities waste reports
[fecha (R), kilogramos, toneladas (R), numero de tiquete ebi, factura,
h_vehicle id, distrito id, comunidad id,
dia, mes]

## Vista

- Todas las vistas cuentan con campos de auditoría de creación y actualización (por quien y cuando) que son automatizados y no modificables. El de creación se conoce como fuente, quien hizo el registro

- Se define los campos de ayuda según el formato del campo

- Se define una venta en el formulario destinada a mensajes como notas visibles para todos, funciona como ventana de notas independiente del registro

- Las vistas básicas son la de lista, la de formulario y una vista mas básica kanban

- solo es visible el módulo de gestión de residuos para quienes tienen un rol de este módulo, para verlo debe agregarse el rol y actualizar la pestaña

- Los campos están correctamente traducidos

- los campos que no son editable en los formularios son auto calculados para mayor precision

## Seguridad y roles

roles actuales:
técnico puede ver y editar todos los registros, puede crear, pero solo puede borrar sus propios registros
auditor puede ver todo, pero no puede editar ni crear

roles pendientes
jefatura
editor
informático

los campos de auditoria no son modificables
