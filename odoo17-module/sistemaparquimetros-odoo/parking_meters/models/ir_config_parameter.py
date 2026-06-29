from odoo import models, fields,api

class IrConfigParameter(models.Model):
    _inherit = 'ir.config_parameter'
    
    @api.model
    def get_parameters(self, args):
        if not isinstance(args, list):
            raise ValueError("Expected a list of args")
        parameters = {key: self.get_param(key) for key in args}
        return parameters

    def create(self, vals):
        res = super(IrConfigParameter, self).create(vals)
        res.update_user_status()
        return res

    def write(self, vals):
        res = super(IrConfigParameter, self).write(vals)
        self.update_user_status()
        return res

    def update_user_status(self):
        modelo_b_records = self.env['res.users'].search([])
        for modelo_b in modelo_b_records:
            modelo_b.updated_status = 'outdated'