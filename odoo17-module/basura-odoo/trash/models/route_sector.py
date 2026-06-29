from odoo import models, fields, api
class RouteSector(models.Model):
    _name = "trash.route_sector"
    _description = "Sectors"
    _rec_name = "name_sector"

    name_sector = fields.Text(string="Name of Sector", required=True)