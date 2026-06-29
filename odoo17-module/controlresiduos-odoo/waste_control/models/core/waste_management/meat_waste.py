from odoo import models, fields, api, _
from odoo.exceptions import ValidationError
from ...utils.date_utils import MONTH_SELECTION


class MeatWaste(models.Model):
    _inherit = ["waste_control.base_model", "mail.thread"]
    _name = "waste_control.meat_waste"
    _description = "Residuos cárnicos"
    _rec_name = "date"
    _order = "date desc"

    # Main fields
    date = fields.Date(
        string="Fecha",
        required=True,
        help="Fecha de registro de residuos cárnico",
    )

    kilograms = fields.Float(
        string="Kilogramos",
        digits=(6, 2),
        required=True,
        help="Cantidades de residuos cárnicos en kilogramos",
    )

    # * Relation fields *
    routes_id = fields.Many2one(
        comodel_name="waste_control.routes",
        string="Rutas",
        help="Información de ruta",
    )

    historic_vehicles_id = fields.Many2one(
        comodel_name="waste_control.historic_vehicles",
        string="Vehículo",
        help="Información de vehículo",
    )

    # * Computed fields *
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

    @api.constrains("kilograms", "year")
    def _check_ranges(self):
        for record in self:
            if record.kilograms < 0:
                raise ValidationError(_("Los kilogramos no pueden ser negativos"))
            if record.year < 1900 or record.year > 3000:
                raise ValidationError(_("El año debe estar entre 1900 y 3000"))
