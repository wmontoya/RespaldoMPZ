"""
Plantilla base para crear nuevos wizards de reportes. que filtran por año.
"""

from odoo import models, fields, api, _
from odoo.exceptions import ValidationError


class BaseYearReportWizard(models.AbstractModel):
    """
    Clase base abstracta para wizards de reportes por año.
    Proporciona wizards de reportes anuales.

    Para crear un nuevo wizard, simplemente hereda de esta clase y define:
    - _name: nombre técnico del wizard
    - _description: descripción del wizard
    - _report_action_ref: referencia XML del reporte a generar

    Ejemplo:
        class MiNuevoWizard(models.TransientModel):
            _name = "waste_control.mi_reporte_wizard"
            _inherit = "waste_control.base_year_report_wizard"
            _description = "Mi reporte wizard"
            _report_action_ref = "waste_control.mi_reporte_action"
    """

    _name = "waste_control.base_year_report_wizard"
    _description = "Base year report wizard"

    # Referencia al reporte - requerido clase hija
    _report_action_ref = None

    year = fields.Integer(
        string="Año",
        required=True,
        default=lambda self: fields.Date.today().year,
        help="Seleccione el año para el reporte",
    )

    def action_print_report(self):
        """
        Usa la referencia definida en _report_action_ref.
        """
        self.ensure_one()

        if not self._report_action_ref:
            raise ValidationError(
                _(
                    "Referencia de acción de reporte no definida. "
                    "Por favor, establezca _report_action_ref en la clase del wizard."
                )
            )

        return self.env.ref(self._report_action_ref).report_action(self)

    @api.constrains("year")
    def _check_year_range(self):
        """
        Validate year is within acceptable range
        Puede ser sobrescrito en clases hijas para validaciones personalizadas.
        """
        for record in self:
            if record.year < 1900 or record.year > 3000:
                raise ValidationError(_("Valor fuera de rango para el campo año"))
