from odoo import models, fields, api

class RouteDay(models.Model):
    _name = "trash.route_day"
    _description = "Trash Route Collection Days"
    _rec_name = "id"

    @api.model
    def _default_sector_id(self):
        """Guarantee a sector is always set (sector_id is required).

        This avoids validation errors when route days are created from imports
        (e.g., KML upload) or other automated processes that might not provide
        a sector.
        """
        Sector = self.env["trash.route_sector"].sudo()
        sector = Sector.search([("name_sector", "=", "SIN SECTOR")], limit=1)
        if not sector:
            sector = Sector.create({"name_sector": "SIN SECTOR"})
        return sector.id

    route_id = fields.Many2one("trash.route", string="Route", ondelete="cascade", required=True)
    waste_type = fields.Selection([
        ("BASURA", "Basura"),
        ("ORGÁNICO", "Orgánico"),
        ("RECICLAJE", "Reciclaje"),
    ], string="Waste Type", required=True)
    day_ids = fields.Many2many(
        "trash.day",
        string="Collection Days"
    )
    day_iteration = fields.Selection([
        ("SEMANAL", "Semanal"),
        ("QUINCENAL", "Quincenal"),
        ("MENSUAL", "Mensual")
    ], string="Day Iteration", required=True)
    
    quincenal_date_ids = fields.One2many(
        "trash.route_quincenal_date",
        "route_day_id",
        string="Quincenal Dates"
    )
    
    collection_time = fields.Selection([
        ("DIURNA", "Diurna"),
        ("NOCTURNA", "Nocturna"),
    ], string="Collection time", default="DIURNA")
    
    sector_id = fields.Many2one(
        comodel_name="trash.route_sector",
        string="Sector",
        required=True,
        default=_default_sector_id,
        ondelete="restrict"
    )
    
    subscription_ids = fields.Many2many(
        comodel_name="trash.route_subscription",
        relation="route_day_subscription_rel",
        column1="route_day_id",
        column2="subscription_id",
        string="Subscribers",
    )
    

    @api.depends('day_ids')
    def _compute_day_list(self):
        for rec in self:
            rec.day_list = ", ".join(rec.day_ids.mapped('display_name'))

    day_list = fields.Char(string="Days (Display)", compute="_compute_day_list")
