from odoo import models, fields, api, _
from odoo.exceptions import ValidationError
from ....utils.date_utils import MONTH_SELECTION


class RecyclingOnRoute(models.Model):
    _inherit = ["waste_control.base_model", "mail.thread"]
    _name = "waste_control.recycling_on_route"
    _description = "Reciclaje en ruta"
    _rec_name = "date"
    _order = "date desc"

    # Main fields
    date = fields.Date(
        string="Fecha",
        required=True,
        help="Fecha de recolección de reciclaje",
    )

    tons = fields.Float(
        string="Toneladas",
        digits=(6, 3),
        required=True,
        help="Cantidad de reciclaje en toneladas",
    )

    rejected_amount = fields.Float(
        string="Importe rechazado",
        digits=(6, 3),
        help="Cantidad de residuos rechazados del reciclaje",
    )

    net_recycling = fields.Float(
        string="Reciclaje neto",
        digits=(6, 3),
        compute="_compute_net_recycling",
        store=True,
        help="Toneladas - cantidad rechazada",
    )

    other_non_recoverable = fields.Float(
        string="Otros no aprovechables",
        digits=(6, 2),
        help="Cantidad de residuos no aprovechables",
    )

    hours_on_route = fields.Float(
        string="Horas en ruta",
        digits=(4, 2),
        help="Tiempo dedicado a la ruta de recolección",
    )

    weighing_time = fields.Float(
        string="Hora de pesaje",
        digits=(4, 2),
        help="Hora en que se realizó el pesaje",
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

    collection_center_id = fields.Many2one(
        comodel_name="waste_control.collection_centers",
        string="Centro de acopio",
        help="Información del centro de recolección",
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

    @api.constrains(
        "tons",
        "other_non_recoverable",
        "hours_on_route",
        "year",
        "rejected_amount",
        "weighing_time",
    )
    def _check_ranges(self):
        for record in self:
            if record.tons < 0:
                raise ValidationError(_("Las toneladas no pueden ser negativas"))
            if record.other_non_recoverable and record.other_non_recoverable < 0:
                raise ValidationError(
                    _("Otros no aprovechables no pueden ser negativos")
                )
            if record.hours_on_route and record.hours_on_route < 0:
                raise ValidationError(_("Las horas en ruta no pueden ser negativas"))
            if record.rejected_amount < 0:
                raise ValidationError(_("La cantidad rechazada no puede ser negativa"))
            if record.weighing_time and (
                record.weighing_time < 0 or record.weighing_time >= 24
            ):
                raise ValidationError(
                    _("La hora de pesaje debe estar en el rango 00:00 - 23:59")
                )
            if record.year < 1900 or record.year > 3000:
                raise ValidationError(_("El año debe estar entre 1900 y 3000"))

    @api.depends("tons", "rejected_amount")
    def _compute_net_recycling(self):
        for record in self:
            record.net_recycling = record.tons - (record.rejected_amount or 0.0)
