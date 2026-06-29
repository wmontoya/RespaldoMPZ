---
description: Estándares y mejores prácticas para desarrollo en Odoo 17
---

# Estándares Odoo 17

## Principios Fundamentales
- Usa `_("texto")` para strings traducibles mostrados al usuario.
- Sigue convenciones de Odoo 17: estructura modular, herencia, permisos.
- Documentación en inglés; textos de usuario en español.
- Excepciones: `ValidationError`, `UserError`, `AccessError`.

## Estructura de Módulo
```
module_name/
├── __init__.py
├── __manifest__.py
├── models/ (lógica de negocio)
├── views/ (XML: form, tree, kanban)
├── security/ (permisos, reglas)
├── data/ (datos iniciales)
├── reports/ (PDF/QWeb)
├── wizard/ (asistentes)
├── static/ (CSS, JS)
└── tests/ (pruebas)
```

## Desarrollo de Modelos y Lógica
- Imports: `from odoo import api, fields, models; from odoo.exceptions import ValidationError; from odoo.tools.translate import _`.
- Definición: `_name`, `_description` (en español), `_inherit` (ej. `mail.thread`).
- Campos: `fields.Char(string=_("Etiqueta"), required=True, help=_("Ayuda"))`.
- Validaciones: `@api.constrains` con `ValidationError(_("Mensaje"))`.
- Métodos: `@api.depends` para computados; búsquedas con `search()`, `mapped()`.
- Logging: `_logger = logging.getLogger(__name__)`.

## Vistas y XML
- Form: `<form string="Título"> <sheet> <field name="campo"/> </sheet> </form>`.
- Datos: `<record model="modelo" id="id"> <field name="campo">valor</field> </record>` (noupdate="0" para actualizables).
- Menús: `<menuitem name="Nombre" parent="padre" action="acción"/>`.
- Evita `attrs`; usa permisos.

## Seguridad y Acceso
- `ir.model.access.csv`: `id,name,model_id:id,group_id:id,perm_read,perm_write,perm_create,perm_unlink`.
- Reglas: `<record model="ir.rule"> <field name="domain_force">[condición]</field> </record>`.
- Grupos: Define roles específicos; contraseñas seguras.

## Reportes
- Modelo: `class Report(models.AbstractModel): _name = "report.module.report"; @api.model def _get_report_values(self, docids, data=None): return {...}`.
- Template: `<t t-name="module.report"> <div class="page"> <h1 t-esc="doc.name"/> </div> </t>`.

## Wizards
- Modelo: `class Wizard(models.TransientModel): _inherit = "base_year_wizard"; _description = "Descripción"; def action_print_report(self): return self.env.ref('report').report_action(self)`.
- Vista: Form con campos y botones.

## Manifest
```python
{
    "name": "Nombre",
    "version": "17.0.1.0.0",
    "depends": ["base"],
    "data": ["security/ir.model.access.csv", "views/views.xml"],
    "installable": True,
}
```

## Convenciones de Código
- Nombres: `snake_case` (modelos plurales, vistas `entity_view.xml`).
- Líneas: Máximo 100 caracteres.
- Documentación: Docstrings en inglés; textos UI en español.

## Traducciones
- Strings: `_("Texto en español")`.
- Archivos: `i18n/es_ES.po`; actualiza vía interfaz Odoo.

## Actualizaciones
- Python/XML: Actualiza módulo en interfaz.
- Traducciones: Extensión Debug, sin detener servicio.

## Referencias
- [Docs Odoo 17](https://www.odoo.com/documentation/17.0/)
