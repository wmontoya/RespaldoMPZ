from odoo import models, fields, api, _
from odoo.exceptions import ValidationError
from ...utils.date_utils import MONTH_SELECTION


class Waste(models.Model):
    _inherit = ["waste_control.base_model", "mail.thread"]
    _name = "waste_control.waste"
    _description = "Residuos orgánicos"
    _rec_name = "date"
    _order = "date desc"

    # Main fields
    date = fields.Date(
        string="Fecha",
        required=True,
        help="Fecha de la recolección de residuos",
    )

    tons = fields.Float(
        string="Toneladas",
        digits=(6, 2),
        required=True,
        help="Cantidad de residuos en toneladas",
    )

    weighing_time = fields.Float(
        string="Hora de pesaje",
        digits=(4, 2),
        help="Hora en que se realizó el pesaje",
    )

    # * Relation fields *
    products_id = fields.Many2one(
        comodel_name="waste_control.products",
        string="Producto",
        help="Tipo de producto de desecho",
    )

    types_of_waste_id = fields.Many2one(
        comodel_name="waste_control.types_of_waste",
        string="Tipo de residuo",
        help="Categoría de residuo (no recuperable, ordinario, orgánico)",
    )

    routes_id = fields.Many2one(
        comodel_name="waste_control.routes",
        string="Rutas",
        help="Información de ruta",
    )

    historic_vehicles_id = fields.Many2one(
        comodel_name="waste_control.historic_vehicles",
        string="Vehículo",
        required=True,
        help="Información de vehículo",
    )

    # * Computed fields *
    capacity_percentage = fields.Float(
        string="Capacidad %",
        compute="_compute_capacity",
        store=True,
        digits=(6, 2),
        help="Porcentaje de la capacidad del vehículo utilizada",
    )

    is_full_load = fields.Boolean(
        string="Carga completa",
        compute="_compute_capacity",
        store=True,
        help="Indica si el viaje fue a plena capacidad (>95%)",
    )

    month = fields.Selection(
        selection=MONTH_SELECTION,
        string="Mes",
        compute="_compute_month",
        store=True,
        readonly=True,
    )

    year = fields.Integer(
        string="Año",
        compute="_compute_year",
        store=True,
        readonly=True,
    )

    # * Functions *
    @api.depends("date")
    def _compute_month(self):
        for record in self:
            record.month = str(record.date.month) if record.date else False

    @api.depends("date")
    def _compute_year(self):
        for record in self:
            record.year = record.date.year if record.date else 0

    @api.depends("tons", "historic_vehicles_id.charge_capacity")
    def _compute_capacity(self):
        for record in self:
            if (
                record.historic_vehicles_id
                and record.historic_vehicles_id.charge_capacity > 0
            ):
                record.capacity_percentage = (
                    record.tons / record.historic_vehicles_id.charge_capacity
                ) * 100
            else:
                record.capacity_percentage = 0.0

            # Consider full load if > 95%
            record.is_full_load = record.capacity_percentage >= 95.0

    @api.constrains("tons", "weighing_time", "year")
    def _check_ranges(self):
        for record in self:
            if record.tons < 0:
                raise ValidationError(_("Las toneladas no pueden ser negativas"))
            if record.weighing_time and (
                record.weighing_time < 0 or record.weighing_time >= 24
            ):
                raise ValidationError(
                    _("La hora de pesaje debe estar en el rango 00:00 - 23:59")
                )
            if record.year < 1900 or record.year > 3000:
                raise ValidationError(_("El año debe estar entre 1900 y 3000"))
