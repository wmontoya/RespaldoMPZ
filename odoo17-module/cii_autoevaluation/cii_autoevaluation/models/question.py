from odoo import models, fields, api


class Question(models.Model):
    _name = "ae.question"
    _description = "Question"
    _rec_name = "title"
    _order = "sequence, title"
    
    sequence = fields.Integer(string="Sequence", default=10)
    title = fields.Text(string="Title")
    description = fields.Text(string="Description")
    guidance_text_justification = fields.Text(
        string="Guidance Text for Justification",
        help="Text to guide users when providing justifications (when answer is 'Yes')"
    )
    guidance_text_proposed_action = fields.Text(
        string="Guidance Text for Proposed Action",
        help="Text to guide users when providing proposed actions (when answer is 'No')"
    )
    section_id = fields.Many2one("ae.section", string="Section")
    aes_answers = fields.One2many("ae.answer", "question_id", string="Answers")
  
    related_components = fields.Many2many(
        "ae.component",
        string="Related Components",
        compute="_compute_related_components",
        store=True
    )
    
    @api.depends('section_id', 'section_id.components')
    def _compute_related_components(self):
        for record in self:
            if record.section_id and record.section_id.components:
                record.related_components = record.section_id.components
            else:
                record.related_components = [(5, 0, 0)]
  