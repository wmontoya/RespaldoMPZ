# -*- coding: utf-8 -*-

import json
import logging
from odoo.http import Controller, Response, request, route
from ..services.user_service import UserService
from ...jwt_auth.jwt_decorator import jwt


_logger = logging.getLogger(__name__)


class UserController(Controller):

    @jwt
    @route('/api/v1/mature-model/users', type='http', auth='public', csrf=False, methods=['GET', 'OPTIONS'])
    def users(self, **kwargs):
        users = request.env['res.users'].sudo().search([])
        if users:
            users_res = UserService.parse_users(users)
            return Response(json.dumps(users_res),
                            content_type='application/json;charset=utf-8',
                            status=200)
        return request.not_found()
 

    @route('/api/v1/mature-model/users/<string:email>', type='http', auth='public', methods=['GET'])
    def users_by_email(self, email):
        user = request.env['res.users'].sudo().search([('email', '=', email)])

        if user:
            user_res = UserService.parse_users(user)
            return Response(json.dumps(user_res),
                            content_type='application/json;charset=utf-8',
                            status=200)
        return request.not_found()
 