from odoo import models, fields, api, _
from odoo.exceptions import ValidationError


class RoutesStudy(models.Model):
    _inherit = ["waste_control.base_model", "mail.thread"]
    _name = "waste_control.routes_study"
    _description = "Estudio de rutas"

    number = fields.Integer(
        string="Número",
        required=True,
        help="Identificador único para la ruta (entero positivo)",
    )

    kilometers_of_route = fields.Float(
        string="Kilómetros lineales de la ruta",
        digits=(6, 2),
        required=True,
        help="Distancia total en kilómetros. Debe ser un valor no negativo",
    )

    # * Relations fields*
    routes_id = fields.Many2one(
        comodel_name="waste_control.routes",
        string="Rutas",
        help="Información de ruta",
    )

    # * Functions *
    @api.constrains("number", "kilometers_of_route")
    def _check_ranges(self):
        for record in self:
            if record.number < 0:
                raise ValidationError(
                    _("Advertencia: El número de ruta no puede ser negativo")
                )
            if record.kilometers_of_route < 0:
                raise ValidationError(
                    _("Advertencia: Los kilómetros de la ruta no pueden ser negativos")
                )
