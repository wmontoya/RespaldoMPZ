from odoo import models, fields, api
class RouteSegment(models.Model):
    _name = "trash.route_segment"
    _description = "Segmento de ruta"

    route_id = fields.Many2one('trash.route', required=True, ondelete='cascade')
    route_line_ids = fields.One2many('trash.route_point', 'segment_id', ondelete='cascade')
