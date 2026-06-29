# -*- coding: utf-8 -*-
from datetime import date, datetime
from odoo import models, fields, api, _


class Complaint(models.Model):
    _name = "trash.complaint"
    _description = "Complaint Registration"
    _order = "create_date desc"
    _sql_constraints = [
        ("external_id_unique", "unique(external_id)", "External complaint ID must be unique."),
    ]

    name = fields.Char(
        string="Complaint Number",
        readonly=True,
        copy=False,
        default=lambda self: _('New')
    )
    external_id = fields.Char(
        string="External Complaint ID",
        readonly=True,
        copy=False,
        index=True
    )
    id_number = fields.Char(
        string="ID Number",
        required=True,
        help="ID number of the citizen filing the complaint"
    )
    citizen_name = fields.Char(
        string="Citizen Name",
        help="Full name of the citizen filing the complaint"
    )
    complaint_type = fields.Char(
        string="Complaint Type",
        help="Classification of the complaint"
    )
    description = fields.Text(
        string="Description",
        required=True,
        help="Detailed description of the complaint"
    )
    reported_at = fields.Datetime(
        string="Reported At",
        default=fields.Datetime.now,
        readonly=True,
        help="Exact datetime when the complaint was reported"
    )
    date = fields.Date(
        string="Registration Date",
        required=True,
        default=lambda self: date.today(),
        readonly=True
    )
    state = fields.Selection(
        [
            ('registered', 'Registered'),
            ('in_review', 'In Review'),
            ('finished', 'Finished'),
        ],
        string="Status",
        default='registered',
        required=True,
        tracking=True
    )
    response = fields.Text(
        string="Response",
        help="Response to the complaint"
    )
    internal_notes = fields.Text(
        string="Internal Notes",
        help="Internal notes for follow-up"
    )

    @api.model_create_multi
    def create(self, vals_list):
        """Create complaints with automatic sequence"""
        base_timestamp_ms = int(datetime.utcnow().timestamp() * 1000)

        for index, vals in enumerate(vals_list):
            if vals.get('name', _('New')) == _('New'):
                vals['name'] = self.env['ir.sequence'].next_by_code(
                    'trash.complaint'
                ) or _('New')

            if not vals.get('external_id'):
                vals['external_id'] = f"QJ-{base_timestamp_ms + index}"

            if vals.get("reported_at") and not vals.get("date"):
                vals["date"] = fields.Date.to_date(vals["reported_at"])

            if not vals.get("reported_at") and vals.get("date"):
                vals["reported_at"] = fields.Datetime.now()

        return super(Complaint, self).create(vals_list)

    def action_set_in_review(self):
        """Change status to In Review"""
        self.write({'state': 'in_review'})

    def action_set_finished(self):
        """Change status to Finished"""
        self.write({'state': 'finished'})

    def action_set_registered(self):
        """Change status to Registered"""
        self.write({'state': 'registered'})
