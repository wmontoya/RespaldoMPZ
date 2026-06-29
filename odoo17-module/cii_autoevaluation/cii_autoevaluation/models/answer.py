from odoo import models, fields, api, _
from odoo.exceptions import UserError

class Answer(models.Model):
    _name = "ae.answer"
    _description = "Answer"
    _rec_name = "response"

    response = fields.Selection(
        [
            ("si", "Sí"),
            ("no", "No"),
            ("sin_respuesta", "Sin Respuesta"),
        ],
        default="sin_respuesta",
        required=True,
        string="Response",
    )

    document = fields.Binary(string="Document")
   
    question_id = fields.Many2one("ae.question", string="Question")
    component_id = fields.Many2one("ae.component", string="Component", )
    department_id = fields.Many2one("hr.department", string="Department")
    survey_id = fields.Many2one("ae.survey", string="Survey")
    survey_answer_id = fields.Many2one("ae.survey.answer", string="Survey Answer")
    
    proposed_actions = fields.One2many("ae.proposed_action", "answer_id", string="Proposed Actions")
    justification_id = fields.One2many("ae.justification", "answer_id", string="Justifications")
    manager_id = fields.Many2one("hr.employee", string="Manager", related="department_id.manager_id")
    section_id = fields.Many2one(
        'ae.section',
        string='Section',
        related='question_id.section_id',
        store=True,
        readonly=True,
    )
    component_section_group = fields.Char(
        string="Component/Section Group",
        compute="_compute_component_section_group",
        store=True,
    )
    proposed_actions_count = fields.Integer(
        string="Number of Proposed Actions",
        compute="_compute_proposed_actions_count",
        store=True,
    )
    justification_count = fields.Integer(
        string="Number of Justifications",
        compute="_compute_justification_count",
        store=True,
    )
    unanswered_button = fields.Char(
        string="Estado",
        compute="_compute_unanswered_button",
        store=False,
    )
    status_badge_type = fields.Selection(
        [
            ('primary', 'Primary'),
            ('secondary', 'Secondary'),
        ],
        compute="_compute_unanswered_button",
        store=False,
    )
    
    def name_get(self):
        result = []
        for rec in self:
            # Find the English label for the selection
            label = dict(self.fields_get(allfields=['response'])['response']['selection']).get(rec.response, rec.response)
            result.append((rec.id, label))
        return result

    @api.model
    def default_get(self, fields_list):
        """Set default values for the answer"""
        res = super().default_get(fields_list)
        
        # If department_id is not provided, get it from the current user
        if not res.get('department_id') and self.env.context.get('default_department_id'):
            res['department_id'] = self.env.context['default_department_id']
        elif not res.get('department_id'):
            current_user = self.env.user
            if current_user.employee_id and current_user.employee_id.department_id:
                res['department_id'] = current_user.employee_id.department_id.id
                
        return res

    @api.model
    def create(self, vals):
        """Ensure department is set when creating an answer"""
        if not vals.get('department_id') and self.env.context.get('default_department_id'):
            vals['department_id'] = self.env.context['default_department_id']
        elif not vals.get('department_id'):
            current_user = self.env.user
            if current_user.employee_id and current_user.employee_id.department_id:
                vals['department_id'] = current_user.employee_id.department_id.id
        
        # Check if we're creating an answer for a submitted survey
        if vals.get('survey_answer_id'):
            survey_answer = self.env['ae.survey.answer'].browse(vals['survey_answer_id'])
            if survey_answer.status == 'submitted':
                raise UserError("You cannot create new answers for a survey that has already been submitted.")
                
        return super().create(vals)

    @api.depends('component_id', 'section_id')
    def _compute_component_section_group(self):
        for rec in self:
            component = rec.component_id.title if rec.component_id else ''
            section = rec.section_id.title if rec.section_id else ''
            rec.component_section_group = f"{component} - {section}" if component or section else '(general)'

    def _check_survey_submitted(self):
        """Check if the parent survey is submitted and raise error if trying to modify"""
        if self.survey_answer_id and self.survey_answer_id.status == 'submitted':
            raise UserError("You cannot modify answers, justifications or proposed actions of a survey that has already been submitted.")

    @api.onchange('response')
    def _onchange_response(self):
        """Trigger UI update when response changes"""
        # This will trigger the recomputation of computed fields
        # and force the UI to refresh the tree view
        pass

    def write(self, vals):
        """Override write to prevent modifications when survey is submitted"""
        self._check_survey_submitted()
        result = super().write(vals)

        # Force recomputation of counts when response changes
        if 'response' in vals:
            self._compute_proposed_actions_count()
            self._compute_justification_count()

        return result

    def unlink(self):
        """Override unlink to prevent deleting answers when survey is submitted"""
        self._check_survey_submitted()
        return super().unlink()

    def toggle_proposed_action(self):
        """Create or edit the proposed action for this answer."""
        self.ensure_one() 

        proposed = self.env['ae.proposed_action']\
                       .search([('answer_id', '=', self.id)], limit=1)

        action = {
            'type': 'ir.actions.act_window',
            'res_model': 'ae.proposed_action',
            'view_mode': 'form',
            'view_id': self.env.ref(
                'cii_autoevaluation.view_ae_proposed_action_form_popup'
            ).id,
        }

        if proposed:
            action.update({
                'name': _('Editar Acción Propuesta'),
                'res_id': proposed.id,        
                'target': 'new',     
                'context': dict(self.env.context),
            })
        else:
            action.update({
                'name': _('Crear Acción Propuesta'),
                'target': 'new',
                'context': {
                    'default_answer_id': self.id,
                    'default_department_id': self.department_id.id or False,
                    'default_accomplishment_level': 'not_done',
                }
            })

        return action

    def delete_proposed_action(self):
        """Delete the proposed action linked to this answer."""
        self.ensure_one()
        self._check_survey_submitted()
        proposed = self.env['ae.proposed_action'].search(
            [('answer_id', '=', self.id)], limit=1
        )
        if not proposed:
            raise UserError(_("No proposed action exists to delete."))
        proposed.unlink()                       
        return {'type': 'ir.actions.act_window_close'}

    def view_proposed_actions(self):
        """View existing proposed actions for this answer"""
        self.ensure_one()
        
        # Return action to open the proposed actions list
        return {
            'type': 'ir.actions.act_window',
            'name': 'Proposed Actions',
            'res_model': 'ae.proposed_action',
            'view_mode': 'tree,form',
            'domain': [('answer_id', '=', self.id)],
            'context': {
                'default_answer_id': self.id,
                'default_department_id': self.department_id.id if self.department_id else False,
                'default_responsible_name': self.env.user.name,
                'default_responsible_email': self.env.user.email,
            }
        }

    @api.depends('proposed_actions')
    def _compute_proposed_actions_count(self):
        for rec in self:
            rec.proposed_actions_count = len(rec.proposed_actions)

    @api.depends('justification_id')
    def _compute_justification_count(self):
        for rec in self:
            rec.justification_count = len(rec.justification_id)

    @api.depends('response')
    def _compute_unanswered_button(self):
        for rec in self:
            if rec.response == 'sin_respuesta':
                rec.unanswered_button = 'Sin responder'
                rec.status_badge_type = 'secondary'
            elif rec.response == 'si':
                rec.unanswered_button = 'Justificación'
                rec.status_badge_type = 'primary'
            elif rec.response == 'no':
                rec.unanswered_button = 'Acción Propuesta'
                rec.status_badge_type = 'primary'
            else:
                rec.unanswered_button = False
                rec.status_badge_type = False

    def toggle_justification(self):
        """Create or edit the justification for this answer."""
        self.ensure_one()
        #self._check_survey_submitted()

        # Only allow justifications for 'Sí' responses
        if self.response != 'si':
            raise UserError(_("Justifications can only be created for 'Sí' responses."))

        justification = self.env['ae.justification']\
                           .search([('answer_id', '=', self.id)], limit=1)

        action = {
            'type': 'ir.actions.act_window',
            'res_model': 'ae.justification',
            'view_mode': 'form',
            'view_id': self.env.ref(
                'cii_autoevaluation.view_ae_justification_popup_form'
            ).id,
        }

        if justification:
            action.update({
                'name': _('Editar Justificación'),
                'res_id': justification.id,        
                'target': 'new',     
                'context': dict(self.env.context),
            })
        else:
            action.update({
                'name': _('Crear Justificación'),
                'target': 'new',           
                'context': {
                    'default_answer_id': self.id,
                    'default_department_id': self.department_id.id or False,
                    'default_title': _('Justificación para: %s') % (self.question_id.title or ''),
                }
            })

        return action

    def delete_justification(self):
        """Delete the justification linked to this answer."""
        self.ensure_one()
        self._check_survey_submitted()
        justification = self.env['ae.justification'].search(
            [('answer_id', '=', self.id)], limit=1
        )
        if not justification:
            raise UserError(_("No justification exists to delete."))
        justification.unlink()                       
        return {'type': 'ir.actions.act_window_close'}

    def view_justifications(self):
        """View existing justifications for this answer"""
        self.ensure_one()

        # Return action to open the justifications list
        return {
            'type': 'ir.actions.act_window',
            'name': 'Justifications',
            'res_model': 'ae.justification',
            'view_mode': 'tree,form',
            'domain': [('answer_id', '=', self.id)],
            'context': {
                'default_answer_id': self.id,
                'default_department_id': self.department_id.id if self.department_id else False,
                'default_title': _('Justification for: %s') % (self.question_id.title or ''),
            }
        }

    def show_unanswered_status(self):
        """Dummy method for unanswered status button - does nothing"""
        return False
