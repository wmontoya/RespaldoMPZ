from odoo import models, fields,api

class Clause(models.Model):
    _name = "parking_meters.clause"
    _description = "Clauses"
    _rec_name = "title"
    
    id = fields.Integer(string="Id")
    name = fields.Char(string="Name")
    description = fields.Char(string="Description")
    title = fields.Char(string="Title")
    article_code_id = fields.Many2one("parking_meters.article", string="Article")
    @api.model
    def create(self, vals):
        res = super(Clause, self).create(vals)
        res.update_user_status()
        return res

    def write(self, vals):
        res = super(Clause, self).write(vals)
        self.update_user_status()
        return res

    def update_user_status(self):
        modelo_b_records = self.env['res.users'].search([])
        for modelo_b in modelo_b_records:
            modelo_b.updated_status = 'outdated'

