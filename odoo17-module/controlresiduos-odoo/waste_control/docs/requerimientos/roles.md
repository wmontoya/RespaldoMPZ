# roles

## Historias de usuario

- Como **Técnico**, quiero ingresar información y eliminar solo los registros que yo mismo creé, para mantener la integridad de mis datos.
- Como **Editor**, quiero ver y confeccionar cuadros resumen y reportes, para analizar y presentar la información de manera clara.
- Como **Jefatura/Coordinador**, quiero visualizar datos, reportes e insumos, para obtener información útil para otros proyectos y la toma de decisiones. Descargar informes y visualizar cualquier información necesaria, para gestionar y supervisar las actividades bajo mi responsabilidad.
- Como **Auditor**, quiero consultar toda la información, para poder realizar auditorías completas y garantizar la transparencia.
- Como **Informática**, quiero administrar parámetros y consultar información, para dar soporte y mantener el correcto funcionamiento del sistema.

## Observaciones

Los perfiles pueden tener varios roles activos

Odoo maneja los roles con los permisos:
perm_read,perm_write,perm_create,perm_unlink

Cada rol deberia tener su propia personalización

Adicionalmente existe una restricción de rol en que solo se puede acceder a sus propios registros o a todos se debe de definir claramente cuales roles tienen esa propiedad, según si puede ver información de otros, si puede editarla y si puede borrarla.

En caso de los permisos para wizard basta con los ACL y solo requiere el de lectura

## Redaccion (resumen)

Permisos ACL: perm_read,perm_write,perm_create,perm_unlink

para los permisos de wizard solo ocupan de lectura porque no tiene un manejo de datos real, tampoco ocupa xml

(waste_control_{var_role_name}_security.xml)

### 0. Rol admin (`group_admin`)

Rol para desarrollo (test)

Permisos ACL: `1,1,1,1`
Permisos ACL wizard (reportes):  `1,0,0,0`

Plantilla xml:

```xml
    <record id="waste_control_{var_name}_rule_group_admin" model="ir.rule">
      <field name="name">Admin users rule</field>
      <field name="model_id" ref="model_waste_control_{var_name}" />
      <field name="domain_force">[(1, '=', 1)]</field>
      <field name="groups" eval="[(4, ref('waste_control.group_admin'))]" />
    </record>
```

### 1. Rol Técnico (`group_technical`)

Ámbito de Acceso: Operativo (Ingreso de datos).
Lectura/Escritura/Creación: Sin restricciones, ve todos los registros
Eliminación: Restringido a registros propios

Permisos ACL: `1,1,1,1`
Permisos ACL wizard (reportes):  `0,0,0,0`

Plantilla xml:

```xml
    <record id="waste_control_{var_name}_rule_group_technical" model="ir.rule">
      <field name="name">Technical users rule</field>
      <field name="model_id" ref="model_waste_control_{var_name}" />
      <field name="domain_force">[(1, '=', 1)]</field>
      <field name="groups" eval="[(4, ref('waste_control.group_technical'))]" />
      <field name="perm_read" eval="1" />
      <field name="perm_write" eval="1" />
      <field name="perm_create" eval="1" />
      <field name="perm_unlink" eval="0" />
    </record>

    <!-- Special rule for delete - only own records -->
    <record id="waste_control_{var_name}_delete_rule_group_technical" model="ir.rule">
      <field name="name">Technical users can only delete own records</field>
      <field name="model_id" ref="model_waste_control_{var_name}" />
      <field name="domain_force">[('create_uid', '=', user.id)]</field>
      <field name="groups" eval="[(4, ref('waste_control.group_technical'))]" />
      <field name="perm_read" eval="0" />
      <field name="perm_write" eval="0" />
      <field name="perm_create" eval="0" />
      <field name="perm_unlink" eval="1" />
    </record>
```

### 2. Rol Auditor (`group_auditor`)

Ámbito de Acceso: Auditoría (Global).
  Reglas de Registro (Record Rules): Sin restricciones, puede ver todos los registros.

  Permisos ACL: `1,0,0,0`
  Permisos ACL wizard (reportes):  `1,0,0,0`

Plantilla xml:

```xml
    <record id="waste_control_{var_name}_rule_group_auditor" model="ir.rule">
      <field name="name">Auditor users rule</field>
      <field name="model_id" ref="model_waste_control_{var_name}" />
      <field name="domain_force">[(1, '=', 1)]</field>
      <field name="groups" eval="[(4, ref('waste_control.group_auditor'))]" />
      <field name="perm_write" eval="0" />
      <field name="perm_create" eval="0" />
      <field name="perm_unlink" eval="0" />
    </record>
```

### 3. Rol Editor (`group_editor`)

Ámbito de Acceso: Analista (Gestión de datos).
  Lectura y Escritura. (Puede corregir datos pero no crear nuevos registros operativos masivamente ni borrar).
  Reglas de Registro (Record Rules): Sin restricciones.

  Permisos ACL (`1,1,0,0`):
  Permisos ACL wizard (reportes):  `1,0,0,0`

Plantilla xml:

```xml
    <record id="waste_control_{var_name}_rule_group_editor" model="ir.rule">
      <field name="name">Editor users rule</field>
      <field name="model_id" ref="model_waste_control_{var_name}" />
      <field name="domain_force">[(1, '=', 1)]</field>
      <field name="groups" eval="[(4, ref('waste_control.group_editor'))]" />
    </record>
```

### 4. Rol Jefatura / Coordinadores (`group_leadership`)

Ámbito de Acceso: Gerencial (Consulta).
  Reglas de Registro (Record Rules): Sin restricciones.

  Permisos ACL: `1,0,0,0`
  Permisos ACL wizard (reportes):  `1,0,0,0`

Plantilla xml:

```xml
    <record id="waste_control_{var_name}_rule_group_leadership" model="ir.rule">
      <field name="name">Leadership users rule</field>
      <field name="model_id" ref="model_waste_control_{var_name}" />
      <field name="domain_force">[(1, '=', 1)]</field>
      <field name="groups" eval="[(4, ref('waste_control.group_leadership'))]" />
      <field name="perm_write" eval="0" />
      <field name="perm_create" eval="0" />
      <field name="perm_unlink" eval="0" />
    </record>
```

### 5. Rol Informática (`group_it`)

Ámbito de Acceso: Administración.
  Acceso total sobre Catálogos Maestros y Parámetros. Acceso de soporte sobre operativas.
  Reglas de Registro (Record Rules): Sin restricciones.

  Permisos ACL: `1,1,1,1`
  Permisos ACL wizard (reportes):  `1,0,0,0`

Plantilla xml:

```xml
    <record id="waste_control_{var_name}_rule_group_it" model="ir.rule">
      <field name="name">IT users rule</field>
      <field name="model_id" ref="model_waste_control_{var_name}" />
      <field name="domain_force">[(1, '=', 1)]</field>
      <field name="groups" eval="[(4, ref('waste_control.group_it'))]" />
    </record>
```
