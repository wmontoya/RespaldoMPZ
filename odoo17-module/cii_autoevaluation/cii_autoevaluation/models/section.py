from odoo import models, fields


class Section(models.Model):
    _name = "ae.section"
    _description = "Section"
    _rec_name = "title"
    _order = "sequence, title"
    
    sequence = fields.Integer(string="Sequence", default=10)
    title = fields.Text(string="Title")
    description = fields.Text(string="Description")
    components = fields.Many2many(
        "ae.component",
        "aes_component_section_rel",
        "section_id",
        "component_id",
        string="Components"
    )
    questions = fields.One2many("ae.question", "section_id", string="Questions")
    
