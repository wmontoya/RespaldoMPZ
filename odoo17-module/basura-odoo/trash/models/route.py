from odoo import models, fields, api
from odoo.exceptions import ValidationError
import json


class TrashRoute(models.Model):
    _name = "trash.route"
    _description = "Trash Collection Route"
    _rec_name = "name"

    name = fields.Char(string="Route Name", required=True, unique=True)
    code = fields.Char(string="Route Code", unique=True)
    description = fields.Text(string="Description")
    color = fields.Char(string="Color")
    day_ids = fields.One2many("trash.route_day", "route_id", string="Collection Days")
    segment_line_ids = fields.One2many(
        "trash.route_segment", "route_id", string="Puntos de la ruta"
    )

    @api.constrains("name")
    def _check_unique_name(self):
        for rec in self:
            existing = self.env["trash.route"].search(
                [("name", "=", rec.name), ("id", "!=", rec.id)], limit=1
            )
            if existing:
                raise ValidationError(f"El nombre de la ruta '{rec.name}' ya existe.")
            
