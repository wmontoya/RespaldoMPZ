---
description: Skill para desarrollo de modelos en Odoo 17
---

# Skill: Desarrollo de Modelos

## Definición y Herencia

- Crea modelos con `_name = "module.model"`, `_description = "Descripción en español"`.
- Hereda: `_inherit = ["mail.thread", "mail.activity.mixin"]` para funcionalidades estándar.

## Campos

- Tipos: `Char`, `Integer`, `Float`, `Date`, `Many2one`, `One2many`.
- Atributos: `string=_("Etiqueta")`, `required=True`, `help=_("Ayuda")`, `domain`, `states`, `groups`, `tracking`.

## Validaciones y Métodos

- `@api.constrains("campo")`: `raise ValidationError(_("Mensaje"))`.
- `@api.depends("campo")`: Computados.
- Búsquedas: `self.env["model"].search([("campo", "=", valor)])`.

## Ejemplo

```python
class Waste(models.Model):
    _name = "waste_control.waste"
    _description = "Residuo"
    
    name = fields.Char(string=_("Nombre"), required=True)
    date = fields.Date(string=_("Fecha"))
    
    @api.constrains("date")
    def _check_date(self):
        if self.date > fields.Date.today():
            raise ValidationError(_("Fecha no puede ser futura"))
```
