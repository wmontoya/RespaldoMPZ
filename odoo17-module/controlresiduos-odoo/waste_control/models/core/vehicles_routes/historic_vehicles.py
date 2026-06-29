from odoo import models, fields, api, _
from odoo.exceptions import ValidationError


class HistoryVehicles(models.Model):
    _inherit = ["waste_control.base_model", "mail.thread"]
    _name = "waste_control.historic_vehicles"
    _description = "Histórico vehículos"
    _rec_name = "plate_number"

    _sql_constraints = [
        (
            "plate_number_unique",
            "UNIQUE(plate_number)",
            "El número de placa debe ser único",
        )
    ]

    number = fields.Char(
        string="Número de vehículo",
        size=15,
        required=True,
        help="Identificador único del vehículo dentro de la empresa",
    )
    plate_number = fields.Char(
        string="Número de placa",
        size=10,
        index=True,
        required=True,
        help="Número de placa oficial del vehículo",
    )
    brand = fields.Char(
        string="Tipo de vehículo",
        size=50,
        help="Marca o tipo de vehículo",
    )
    year = fields.Integer(
        string="Año del vehículo",
        help="Año de fabricación del vehículo",
    )
    charge_capacity = fields.Float(
        string="Capacidad de carga",
        digits=(6, 2),
        help="Capacidad máxima de carga del vehículo en toneladas",
    )
    state = fields.Text(
        string="Estado",
        help="Condición actual del vehículo",
    )

    # * Relation fields *
    drivers_id = fields.Many2one(
        comodel_name="waste_control.drivers",
        string="Conductor",
        help="Información de conductor",
    )

    # * Functions *
    @api.constrains("year", "number", "charge_capacity")
    def _check_ranges(self):
        for record in self:
            if record.year and (record.year < 1900 or record.year > 3000):
                raise ValidationError(_("El año debe estar entre 1900 y 3000"))
            if record.charge_capacity < 0:
                raise ValidationError(
                    _("El valor de capacidad de carga no puede ser negativo")
                )
