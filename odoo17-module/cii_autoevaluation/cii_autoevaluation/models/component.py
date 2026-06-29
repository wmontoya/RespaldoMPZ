from odoo import models, fields


class Component(models.Model):
    _name = "ae.component"
    _description = "Component"
    _rec_name = "title"
    _order = "sequence, title"

    sequence = fields.Integer(string="Sequence", default=10)
    title = fields.Char(string="Title")
    surveys = fields.Many2many(
        "ae.survey",
        "ae_survey_component_rel",
        "component_id",
        "survey_id",
        string="Surveys"
    )
    sections = fields.Many2many(
        "ae.section",
        "aes_component_section_rel",
        "component_id",
        "section_id",
        string="Sections"
    )
    aes_answers = fields.One2many("ae.answer", "component_id", string="Answers")



