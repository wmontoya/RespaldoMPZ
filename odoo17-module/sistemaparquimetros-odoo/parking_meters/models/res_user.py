# -*- coding: utf-8 -*-
import uuid
from odoo import models, fields, api

class ResUser(models.Model):
    _inherit = 'res.users'

    api_key = fields.Char(string="API Key", readonly=True)
    phone_mac_direction = fields.Char(string='Phone MAC Direction')
    updated_status = fields.Selection([
        ('outdated', 'Outdated'),
        ('updated', 'Updated'),
    ], string='Updated Status', default='outdated', readonly=False)
    def _default_groups_id(self):
        internal_user_group_id = self.env.ref('base.group_user').id
        return [(4, internal_user_group_id)]

    groups_id = fields.Many2many(default=_default_groups_id)
 
    def action_open_user_form(self):
        view_id = self.env.ref('parking_meters.view_admin_user_form').id
        return {
            "type": "ir.actions.act_window",
            "name": "User Information",
            "view_mode": "form",
            "res_model": "res.users",
            "res_id": self.id,
            "target": "current",
            "views": [(view_id, "form")],
        }

    def generate_api(self, username):
        users = self.env['res.users'].sudo().search([('login', '=', username)])
        if not users.api_key:
            users.api_key = str(uuid.uuid4())
            key = users.api_key
        else:
            key = users.api_key
        return key

    def write(self, vals):
        if 'phone_mac_direction' in vals:
            vals['updated_status'] = 'updated'
        res = super(ResUser, self).write(vals)
        if 'phone_mac_direction' in vals:
            self.update({'updated_status': 'outdated'})

        return res