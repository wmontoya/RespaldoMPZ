# -*- coding: utf-8 -*-

from odoo import http
from odoo.http import request
from odoo.exceptions import AccessError


class AccessRedirectController(http.Controller):

    @http.route('/autoevaluation/access_error', type='http', auth='user', website=True)
    def access_error_page(self, **kwargs):
        """Show custom access error page for assessee users"""
        # Check if user is assessee
        if request.env.user.has_group('cii_autoevaluation.group_autoevaluation_assessee'):
            return request.render('cii_autoevaluation.assessee_access_error_page')
        else:
            # For other users, redirect to main page
            return request.redirect('/web')

    @http.route('/autoevaluation/assessee_redirect', type='json', auth='user')
    def assessee_redirect(self, **kwargs):
        """Handle redirection for assessee users when they get access errors"""
        try:
            # Check if user is assessee
            if request.env.user.has_group('cii_autoevaluation.group_autoevaluation_assessee'):
                survey_answer_model = request.env['ae.survey.answer']
                redirect_action = survey_answer_model.redirect_assessee_to_assessments()
                return redirect_action
            else:
                return False
        except Exception as e:
            return False

    @http.route('/autoevaluation/check_access', type='json', auth='user')
    def check_access_and_redirect(self, model=None, **kwargs):
        """Check access for a model and redirect if necessary"""
        try:
            if not model:
                return False

            # Check if user is assessee and trying to access restricted models
            if (request.env.user.has_group('cii_autoevaluation.group_autoevaluation_assessee') and
                model in ['ae.component', 'ae.section', 'ae.question', 'ae.survey']):

                survey_answer_model = request.env['ae.survey.answer']
                redirect_action = survey_answer_model.redirect_assessee_to_assessments()
                return redirect_action

            return False
        except Exception as e:
            return False