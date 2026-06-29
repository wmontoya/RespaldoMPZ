---
description: Skill para creación de vistas XML en Odoo 17
---

# Skill: Vistas XML

## Tipos de Vistas

- **Form**: `<form string="Título"> <sheet> <field name="campo"/> </sheet> </form>`.
- **Tree**: `<tree> <field name="campo"/> </tree>`.
- **Kanban**: `<kanban> <field name="campo"/> </kanban>`.

## Elementos

- Campos: `<field name="campo" string="Etiqueta"/>`.
- Botones: `<button string="Acción" type="object" name="method"/>`.
- Grupos: `<group> <field.../> </group>`.

## Datos y Menús

- Registros: `<record model="model" id="id"> <field name="campo">valor</field> </record>`.
- Menús: `<menuitem name="Nombre" parent="padre" action="acción"/>`.

## Restricciones

- No uses `attrs`; usa permisos en campos (`groups`).

## Ejemplo

```xml
<form string="Residuo">
  <sheet>
    <group>
      <field name="name"/>
      <field name="date"/>
    </group>
  </sheet>
</form>
```
