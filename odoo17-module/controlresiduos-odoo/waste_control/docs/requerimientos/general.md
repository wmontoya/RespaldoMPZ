# Manejo de datos

## Módulo de entidades menores

En común tienen el campo: **nombre** (único, R) / `name`. Algunas tienen un campo de **descripción** (opcional) / `description` o `details`.

### Ubicaciones

1. Provincias / `provinces` — *San Jose*
2. Cantones / `cantons` — *Perez Zeledon*
3. Distritos / `districts`
4. Comunidades / `communities`

Relacionados en el orden jerárquico anterior.

### Contactos

- Centros de recolección / `collection centers`
- Conductores / `drivers`
- Cuadrillas / `squads`
- Supervisores / `supervisors`

Estos campos están directamente relacionados con `res.partner` para sincronizar con los usuarios de Odoo.

### General

- Método de pago / `payment methods`  
    *sinpe, tiquete, tarjeta, efectivo*
- Productos / `products`
- Programa de reciclaje / `recycle programs`
- Rutas / `routes`
- Tipos de residuos / `types of waste`  
    *por defecto: no aprovechable, ordinario, orgánico*

## Módulos principales / core {#módulos-principales-core}

### 1. Módulo vehículos - rutas {#módulo-vehículos---rutas}

- Histórico vehículos / `historic vehicles` — *h_vehículo*

    **Campos:**  
  - número (R)  
  - número placa (R)  
  - marca  
  - año  
  - capacidad de carga  
  - estado (texto)  
  - conductor id

- Estudio de rutas / `routes study`

    **Campos:**  
  - número (R)  
  - kilómetros lineales de ruta (R)  
  - ruta id

- Rutas de vehículos / `vehicle routes`

    **Campos:**  
  - número (R)  
  - año  
  - capacidad de carga  
  - observaciones  
  - conductor id  
  - h_vehículo id  
  - ruta id

### 2. Módulo Comb - km {#módulo-comb---km}

- Factura / `bills`  
    *Nota: entidad nueva a petición, de separar orden de compra*

    **Campos:**  
  - número factura (único, R)  
  - fecha (R)  
  - monto (R)  
  - moneda id

- Orden de compra de combustible / `fuel purchase orders`

    **Campos:**  
  - fecha (R)  
  - litros (R)  
  - monto (R)  
  - número OC  
  - cupón  
  - factura id  
  - solicitante id  
  - h_vehículo id  
  - moneda id

- Kilometrajes recorridos / `kilometers traveled`

    **Campos:**  
  - fecha  
  - km salida  
  - km entrada  
  - km total  
  - residuos (texto)  
  - horas en ruta  
  - observaciones  
  - conductor id  
  - cuadrilla id  
  - ruta id  
  - h_vehículo id  
  - mes

### 3. Módulo de registro de residuos {#modulo-de-registro-de-residuos}

#### Reciclaje

- Reciclaje por campañas / `recycling by campaigns`

    **Campos:**  
  - lugar  
  - fecha (R)  
  - toneladas (R)  
  - distrito id  
  - programa reciclaje id  
  - h_vehículo  
  - mes  
  - año

- Reciclaje en ruta / `recycling on route`

    **Campos:**  
  - fecha (R)  
  - toneladas (R)  
  - otros no aprovechables (texto)  
  - horas en ruta  
  - hora pesaje  
  - ruta id  
  - h_vehículo id  
  - centro de recolección id  
  - mes  
  - año

#### Otros

- Tonelajes Buenos Aires / `buenos aires tonnages`

    **Campos:**  
  - fecha facturación (R)  
  - toneladas (R)  
  - notas  
  - tiquete  
  - h_vehicle id (R)  
  - driver id  
  - mes

- Residuos cárnicos / `meat waste`

    **Campos:**  
  - fecha (R)  
  - kilogramos (R)  
  - ruta id  
  - h_vehicle id  
  - mes  
  - año

- Compañías privadas / `private companies`

    **Campos:**  
  - fecha (R)  
  - peso toneladas (R)  
  - número de comprobante (R)  
  - monto a pagar (R)  
  - monto pagado (R)  
  - diferencia  
  - observaciones  
  - peso tiquete  
  - desconocido  
  - h_vehicle id  
  - conductor id  
  - método de pago id  
  - moneda id  
  - mes  
  - año

- Orden de compra EBI / `purchase order EBI`

    **Campos:**  
  - fecha (R)  
  - orden de compra (R)  
  - tonelaje (R)  
  - costo  
  - notas  
  - moneda id  
  - mes  
  - año

- Residuos / `waste`  
    *no aprovechable, ordinario, orgánico*

    **Campos:**  
  - fecha (R)  
  - toneladas (R)  
  - hora pesaje  
  - producto id  
  - tipo de residuo id  
  - ruta id  
  - h_vehículo id  
  - mes  
  - año

- Reportes de residuos de comunidades / `communities waste reports`

    **Campos:**  
  - fecha (R)  
  - kilogramos  
  - toneladas (R)  
  - número de tiquete EBI  
  - factura  
  - h_vehicle id  
  - distrito id  
  - comunidad id  
  - día  
  - mes

## Vista {#vista-1}

- Todas las vistas cuentan con campos de auditoría de creación y actualización (por quién y cuándo) que son automatizados y no modificables. El de creación se conoce como fuente, quien hizo el registro.
- Se definen los campos de ayuda según el formato del campo.
- Se define una ventana en el formulario destinada a mensajes como notas visibles para todos, funciona como ventana de notas independiente del registro.
- Las vistas básicas son la de lista, la de formulario y una vista más básica tipo kanban.
- Solo es visible el módulo de gestión de residuos para quienes tienen un rol de este módulo; para verlo debe agregarse el rol y actualizar la pestaña.
- Los campos están correctamente traducidos.
- Los campos que no son editables en los formularios son auto calculados para mayor precisión.

## Seguridad y roles

**Roles actuales:**

- **técnico:** puede ver y editar todos los registros, puede crear, pero solo puede borrar sus propios registros.
- **auditor:** puede ver todo, pero no puede editar ni crear.

**Roles pendientes:**

- jefatura
- editor
- informático

Los campos de auditoría no son modificables.
