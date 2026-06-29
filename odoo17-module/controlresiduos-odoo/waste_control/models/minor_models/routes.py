from odoo import models, fields, api, _


class Routes(models.Model):
    _inherit = ["waste_control.base_model", "mail.thread"]
    _name = "waste_control.routes"
    _description = "Rutas"
    _rec_name = "name"
    _order = "name"

    _sql_constraints = [
        ("name_unique", "UNIQUE(name)", "El nombre del cantón debe ser único")
    ]

    name = fields.Char(
        string="Nombre",
        size=100,
        required=True,
        help="Ingrese el nombre",
    )

    description = fields.Char(
        string="Descripción",
        size=100,
        help="Breve descripción de la ruta, opcional",
    )

    # * Relations *
    districts_id = fields.Many2one(
        comodel_name="waste_control.districts",
        string="Distritos",
        help="Distrito asociado a la ruta (opcional)",
    )

    # * Inverse relations *
    kilometers_traveled_ids = fields.One2many(
        comodel_name="waste_control.kilometers_traveled",
        inverse_name="routes_id",
        string="Kilómetros recorridos",
    )

    routes_study_ids = fields.One2many(
        comodel_name="waste_control.routes_study",
        inverse_name="routes_id",
        string="Estudio de rutas",
    )

    # * Count fields for statistics *
    kilometers_count = fields.Integer(
        string="Kilometers count",
        compute="_compute_kilometers_count",
    )

    studies_count = fields.Integer(
        string="Studies count",
        compute="_compute_studies_count",
    )

    # * Functions *
    @api.depends("kilometers_traveled_ids")
    def _compute_kilometers_count(self):
        """Compute the total kilometers traveled for each route"""
        for record in self:
            record.kilometers_count = sum(
                record.kilometers_traveled_ids.mapped("total_km")
            )

    @api.depends("routes_study_ids")
    def _compute_studies_count(self):
        """Compute the number of studies"""
        for record in self:
            record.studies_count = len(record.routes_study_ids)
