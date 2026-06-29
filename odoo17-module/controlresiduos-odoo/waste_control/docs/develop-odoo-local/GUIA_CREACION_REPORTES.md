# Guía para la Creación de Reportes en Odoo

Esta guía describe los pasos y reglas para crear reportes en el módulo waste_control, siguiendo la estructura y convenciones del ejemplo "Private companies collection control report".

---

## 1. Crear el Wizard

- Ubicación: `wizard/reports/[core|minor]/[submodulo]/[nombre]_wizard.py` y `[nombre]_wizard_view.xml`
- El wizard hereda de `waste_control.base_year_report_wizard` si el reporte es anual.
- Ejemplo de clase wizard:

 ```python
 from odoo import models

 class PrivateCompaniesWizard(models.TransientModel):
   _name = "waste_control.private_companies_wizard"
   _inherit = "waste_control.base_year_report_wizard"
   _description = "Private companies wizard"
   _report_action_ref = "waste_control.private_companies_report_action"
 ```

- Vista XML:

 ```xml
 <record id="private_companies_wizard_form" model="ir.ui.view">
  <field name="name">private.companies.wizard.form</field>
  <field name="model">waste_control.private_companies_wizard</field>
  <field name="arch" type="xml">
   <form string="Private companies report">
    <group>
     <field name="year" widget="char" size="4" placeholder="Enter the year" />
    </group>
    <footer>
     <button string="Generate report" name="action_print_report" type="object" class="btn-primary" />
     <button string="Cancelar" class="btn-danger" special="cancel" />
    </footer>
   </form>
  </field>
 </record>
 ```

## 2. Crear el Reporte

- Ubicación: `reports/core/[submodulo]/[nombre]_report.py` y `[nombre]_report.xml`
- El modelo hereda de `models.AbstractModel` y define `_get_report_values`.
- Ejemplo de clase reporte:

 ```python
 from odoo import models, api, _
 from calendar import month_name
 from ...report_utils import get_report_date

 class PrivateCompaniesReport(models.AbstractModel):
   _name = "report.waste_control.private_companies_report"
   _description = "Private companies report"

   @api.model
   def _get_report_values(self, docids, data=None):
     wizard = self.env["waste_control.private_companies_wizard"].browse(docids)
     wizard.ensure_one()
     # ... lógica de agrupación y retorno ...
 ```

- Vista QWeb:

 ```xml
 <template id="private_companies_report_document">
  <div class="page">
   <h2>Private companies collection control report - year <span t-esc="selected_year" /></h2>
   <p class="text-muted">Report date: <span t-esc="report_date" /></p>
   <!-- tabla de datos -->
  </div>
 </template>
 <record id="private_companies_report_action" model="ir.actions.report">
  <field name="model">waste_control.private_companies_wizard</field>
  <field name="report_type">qweb-pdf</field>
  <field name="report_name">waste_control.private_companies_report</field>
  <field name="print_report_name">(f'Private_Companies_Report_{object.year}')</field>
  <field name="paperformat_id" ref="waste_control.paperformat_landscape_waste" />
 </record>
 ```

## 3. Agregar a Menú, Manifest y Permisos

### Menú

- Ubicación: `views/menu_view.xml`
- Agregar una entrada de menú que apunte al wizard:

 ```xml
 <menuitem id="menu_private_companies_report" name="Private Companies Report" parent="menu_reports" action="private_companies_wizard_action"/>
 ```

### Manifest

- Ubicación: `__manifest__.py`
- Agregar las rutas de los archivos XML del wizard y reporte en la clave `"data"`:

 ```python
 "wizard/reports/core/waste_management/private_companies_wizard_view.xml",
 "reports/core/waste_management/private_companies_report.xml",
 ```

### Permisos

- Ubicación: `security/ir.model.access.csv`
- Agregar permisos para el wizard:

 ```csv
 access_waste_control_private_companies_wizard_auditor,waste_control_private_companies_wizard_auditor,model_waste_control_private_companies_wizard,group_auditor,1,0,0,0
 ```

---

## Reglas de Nombramiento

- El nombre del archivo para el PDF se define como: `(f'Private_Companies_Report_{object.year}')`
- En otros casos, solo la primera palabra lleva inicial mayúscula, excepto nombres de lugares o abreviaciones.
- Ejemplo: "Private companies collection control report - year 2026"

---

## Resumen de Estructura

- Wizard: `wizard/reports/core/waste_management/private_companies_wizard.py` y `.xml`
- Reporte: `reports/core/waste_management/private_companies_report.py` y `.xml`
- Menú: `views/menu_view.xml`
- Manifest: `__manifest__.py`
- Permisos: `security/ir.model.access.csv`

---

Sigue esta guía para crear cualquier reporte nuevo, adaptando los nombres y ubicaciones según el submódulo y el tipo de reporte.
