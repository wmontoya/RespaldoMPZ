from odoo import models, fields, api
class RoutePoint(models.Model):
    _name = "trash.route_point"

    route_id = fields.Many2one('trash.route', required=True, ondelete='cascade')
    segment_id = fields.Many2one('trash.route_segment', required=True, ondelete='cascade')
    latitude = fields.Float()
    longitude = fields.Float()
