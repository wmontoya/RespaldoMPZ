from odoo import models, fields, api, _
from odoo.exceptions import ValidationError
from ....utils.date_utils import MONTH_SELECTION


class RecyclingByCampaigns(models.Model):
    _inherit = ["waste_control.base_model", "mail.thread"]
    _name = "waste_control.recycling_by_campaigns"
    _description = "Reciclaje por campañas"
    _rec_name = "date"
    _order = "date desc"

    # Main fields
    place = fields.Char(
        string="Lugar",
        size=50,
        help="Ubicación de la campaña de reciclaje (granja u otro)",
    )

    date = fields.Date(
        string="Fecha",
        required=True,
        help="Fecha de la campaña de reciclaje",
    )

    tons = fields.Float(
        string="Toneladas",
        digits=(6, 3),
        required=True,
        help="Cantidad de materiales recolectados en toneladas",
    )

    # * Relation fields *
    districts_id = fields.Many2one(
        comodel_name="waste_control.districts",
        string="Distritos",
        help="Información de distritos",
    )

    recycle_programs_id = fields.Many2one(
        comodel_name="waste_control.recycle_programs",
        string="Programa de reciclaje",
        help="Programa de reciclaje asociado",
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

    @api.constrains("tons", "year")
    def _check_ranges(self):
        for record in self:
            if record.tons < 0:
                raise ValidationError(_("Las toneladas no pueden ser negativas"))
            if record.year < 1900 or record.year > 3000:
                raise ValidationError(_("El año debe estar entre 1900 y 3000"))
