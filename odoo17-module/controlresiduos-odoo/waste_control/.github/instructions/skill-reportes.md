---
description: Skill para creación de reportes en Odoo 17
---

# Skill: Reportes

## Modelo de Reporte

- Hereda `models.AbstractModel`.
- `_name = "report.module.report"`.
- `_description = "Descripción en español"`.
- Método: `@api.model def _get_report_values(self, docids, data=None): return {"doc_ids": docids, "data": data, ...}`.

## Template QWeb

- `<t t-name="module.report"> <div class="page"> <h1 t-esc="doc.name"/> <table> <tr t-foreach="lines" t-as="line"> <td t-esc="line.name"/> </tr> </table> </div> </t>`.

## Acción de Reporte

- `<record model="ir.actions.report"> <field name="model">wizard.model</field> <field name="report_name">module.report</field> <field name="print_report_name">f'Nombre_{object.year}'</field> </record>`.

## Wizards para Reportes

- Hereda `waste_control.base_year_report_wizard`.
- Campo `year = fields.Integer(string=_("Año"))`.
- Método `action_print_report`: `return self.env.ref('report').report_action(self)`.

## Ejemplo

- Ver `GUIA_CREACION_REPORTES.md` para flujo completo.
