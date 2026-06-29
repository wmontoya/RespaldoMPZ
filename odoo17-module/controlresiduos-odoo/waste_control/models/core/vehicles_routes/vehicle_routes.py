from odoo import models, fields, api, _
from odoo.exceptions import ValidationError


class VehicleRoutes(models.Model):
    _inherit = ["waste_control.base_model", "mail.thread"]
    _name = "waste_control.vehicle_routes"
    _description = "Rutas de vehículos"
    _rec_name = "number"

    number = fields.Integer(
        string="Número",
        required=True,
        help="Identificador único para la ruta del vehículo",
    )

    year = fields.Integer(
        string="Año",
        help="Año de fabricación o puesta en servicio del vehículo",
    )
    charge_capacity = fields.Float(
        string="Capacidad de carga",
        digits=(6, 2),
        help="Capacidad máxima de carga del vehículo en toneladas",
    )

    observation = fields.Text(
        string="Observación",
        help="Notas adicionales o comentarios",
    )

    # * Relation fields *
    drivers_id = fields.Many2one(
        comodel_name="waste_control.drivers",
        string="Conductor",
        ondelete="restrict",
        help="Información de conductor",
    )

    historic_vehicles_id = fields.Many2one(
        comodel_name="waste_control.historic_vehicles",
        string="Vehículo",
        ondelete="restrict",
        help="Información de histórico de vehículo",
    )

    routes_id = fields.Many2one(
        comodel_name="waste_control.routes",
        string="Rutas",
        ondelete="restrict",
        help="Información de ruta",
    )

    # * Functions *
    @api.constrains("year", "charge_capacity")
    def _check_ranges(self):
        for record in self:
            if record.year and (record.year < 1900 or record.year > 3000):
                raise ValidationError(_("El año debe estar entre 1900 y 3000"))
            if record.charge_capacity < 0:
                raise ValidationError(_("La capacidad de carga no puede ser negativa"))
