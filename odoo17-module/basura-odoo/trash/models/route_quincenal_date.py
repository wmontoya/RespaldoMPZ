from odoo import models, fields

class RouteQuincenalDate(models.Model):
    _name = "trash.route_quincenal_date"
    _description = "Fechas quincenales de recolección"

    route_day_id = fields.Many2one(
        "trash.route_day",
        string="Route Day",
        ondelete="cascade",
        required=True
    )

    collection_date = fields.Date(
        string="Recollection Date",
        required=True
    )
