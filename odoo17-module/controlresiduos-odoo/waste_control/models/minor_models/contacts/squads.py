from odoo import models, fields, api


class Squads(models.Model):
    _inherit = ["waste_control.base_model", "mail.thread"]
    _name = "waste_control.squads"
    _description = "Cuadrillas"
    _rec_name = "person_names"
    _order = "person_names"

    _sql_constraints = [
        (
            "unique_person_names",
            "unique(person_names)",
            "Los nombres de las personas deben ser únicos",
        )
    ]

    details = fields.Text(
        string="Detalle",
        help="Detalles sobre la cuadrilla",
    )

    # * Relation fields *
    partner_ids = fields.Many2many(
        comodel_name="res.partner",
        string="Nombres",
        required=True,
        ondelete="restrict",
        domain="[('is_company', '=', False)]",
        help="Las personas que forman parte del equipo",
    )  # @Unique

    # * compute fields *
    person_names = fields.Char(
        string="Nombres de personas",
        compute="_compute_person_names",
        store=True,
        readonly=True,
    )  # @Unique

    # * Inverse relations *
    kilometers_traveled_ids = fields.One2many(
        comodel_name="waste_control.kilometers_traveled",
        inverse_name="squads_id",
        string="Kilómetrajes recorridos",
    )

    # * Functions*
    @api.depends("partner_ids")
    def _compute_person_names(self):
        """get the names of the people, sorted alphabetically and joined by commas"""
        for record in self:
            names = sorted(str(name) for name in record.partner_ids.mapped("name"))
            record.person_names = ", ".join(names)
