---
description: Skill para configuración de seguridad en Odoo 17
---

# Skill: Seguridad y Acceso

## Permisos CRUD

- Archivo `ir.model.access.csv`:

  ```
  id,name,model_id:id,group_id:id,perm_read,perm_write,perm_create,perm_unlink
  access_waste_user,Acceso Residuo,model_waste_control_waste,base.group_user,1,1,1,0
  ```

## Reglas de Registro

- `<record model="ir.rule" id="rule_waste"> <field name="name">Regla Residuo</field> <field name="model_id" ref="model_waste_control_waste"/> <field name="domain_force">[("user_id", "=", user.id)]</field> <field name="groups" eval="[(4, ref('group_user'))]"/> </record>`.

## Grupos y Roles

- Define grupos en `security/groups.xml`.
- Asigna permisos por rol (ej. admin, editor, auditor).

## Restricciones

- Contraseñas seguras; no acceso masivo.
- Auditoría: Usa `tracking=True` en campos; logs en acciones.

## Ejemplo

- Para modelo `waste_control.waste`, restringe escritura a grupo "editor".
