# -*- coding: utf-8 -*-
import json
import logging
from odoo.http import Controller, Response, request, route
from ..services.user_service import UserService
_logger = logging.getLogger(__name__)

class UsersController(Controller):
    @route('/api/v1/sevri/users', type='http', auth='public', csrf=False, methods=['GET', 'OPTIONS'])
    def get_users(self, **kwargs):
        users = request.env['res.users'].sudo().search([])
        if users:
            users_res = UserService.parse_users(users)
            return Response(json.dumps(users_res),
                            content_type='application/json;charset=utf-8',
                            status=200)
        return Response(json.dumps({'error': 'There is no users.'}),
                        content_type='application/json;charset=utf-8',
                        status=404)