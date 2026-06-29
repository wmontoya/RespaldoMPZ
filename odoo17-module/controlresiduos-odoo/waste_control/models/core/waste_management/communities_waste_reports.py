from odoo import models, fields, api, _
from odoo.exceptions import ValidationError
from ...utils.date_utils import MONTH_SELECTION, DAYS_SELECTION


class CommunitiesWasteReports(models.Model):
    _inherit = ["waste_control.base_model", "mail.thread"]
    _name = "waste_control.communities_waste_reports"
    _description = "Reportes de residuos en comunidades"
    _rec_name = "date"
    _order = "date desc"

    # Main fields
    date = fields.Date(
        string="Fecha",
        required=True,
        help="Fecha del reporte de residuos",
    )

    kilograms = fields.Integer(
        string="Kilogramos",
        help="Cantidad en kilogramos",
    )

    tons = fields.Float(
        string="Toneladas",
        digits=(6, 2),
        required=True,
        help="Cantidad en toneladas",
    )

    ebi_ticket_number = fields.Char(
        string="EBI número de tiquete",
        size=10,
        help="EBI referencia de numero de tiquete",
    )

    bill = fields.Char(
        string="Factura",
        size=10,
        help="Numero de referencia de factura",
    )

    # * Relation fields *
    historic_vehicles_id = fields.Many2one(
        comodel_name="waste_control.historic_vehicles",
        string="Vehículo",
        help="Información de vehículo",
    )

    districts_id = fields.Many2one(
        comodel_name="waste_control.districts",
        string="Distritos",
        help="Información de distritos",
    )

    communities_id = fields.Many2one(
        comodel_name="waste_control.communities",
        string="Comunidad",
        help="Información de comunidad",
    )

    # * Computed fields *
    day = fields.Selection(
        selection=DAYS_SELECTION,
        string="Dia",
        compute="_compute_day",
        store=True,
        readonly=True,
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
    def _compute_day(self):
        for record in self:
            if record.date:
                record.day = str(record.date.weekday() + 1)
            else:
                record.day = False

    @api.depends("date")
    def _compute_month(self):
        for record in self:
            record.month = str(record.date.month) if record.date else False

    @api.depends("date")
    def _compute_year(self):
        for record in self:
            record.year = record.date.year if record.date else 0

    @api.constrains("kilograms", "tons", "year")
    def _check_ranges(self):
        for record in self:
            if record.kilograms and record.kilograms < 0:
                raise ValidationError(_("Los kilogramos no pueden ser negativos"))
            if record.tons < 0:
                raise ValidationError(_("Las toneladas no pueden ser negativas"))
            if record.year and (record.year < 1900 or record.year > 3000):
                raise ValidationError(_("El año debe estar entre 1900 y 3000"))
