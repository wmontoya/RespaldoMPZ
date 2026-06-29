from odoo import models, fields


class PatrimonialFinca(models.Model):
    _name = "patrimonial.finca"
    _description = "Estate"
    _rec_name = "num_finca"

    num_plano = fields.Char(string="Flat Number", required=True)
    num_finca = fields.Char(string="Estate Number", required=True)
    medida = fields.Float(string="Measure (m²)")
    district_id = fields.Many2one(
        "patrimonial.district", string="District", required=True
    )
    observaciones = fields.Text(string="Observations")
    active = fields.Boolean(string="Active", default=True)

    use_ids = fields.Many2many(
        "patrimonial.finca.use", "finca_use_rel", "finca_id", "use_id", string="Uses"
    )

    estate_id = fields.Many2one("patrimonial.property", string="Property")
