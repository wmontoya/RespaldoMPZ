# -*- coding: utf-8 -*-

import json
import logging
from odoo.http import Controller, Response, request, route
from ..services.proposed_action_service import ProposedActionService

_logger = logging.getLogger(__name__)


def create_json_response(data=None, status=200, message="OK"):
    return json.dumps({
        "data": data if data is not None else [],
        "status": status,
        "message": message,
    })


class ProposedActionController(Controller):
    def __init__(self):
        super().__init__()
        self.proposed_action_service = ProposedActionService(request)

    @route(
        "/api/v1/sevri/proposed-actions/department/<int:department_id>",
        type="http",
        auth="public",
        methods=["GET"],
        csrf=False,
    )
    def get_proposed_actions(self, department_id, **kwargs):
        try:
            activities = (
                request.env["sev.activity"]
                .sudo()
                .search([("department_id.id", "=", department_id)])
            )
            activity_ids = activities.mapped("id")

            events = (
                request.env["sev.event"]
                .sudo()
                .search([("activity_id.id", "in", activity_ids)])
            )
            event_ids = events.mapped("id")

            proposed_actions = (
                request.env["sev.proposed_action"]
                .sudo()
                .search([("event_id.id", "in", event_ids)])
            )

            proposed_actions_data = (
                self.proposed_action_service._format_proposed_actions(proposed_actions)
            )

            if not proposed_actions_data:
                return Response(
                    create_json_response(
                        data=[],
                        status=404,
                        message="Proposed Actions not found",
                    ),
                    content_type="application/json;charset=utf-8",
                    status=404,
                )

            return Response(
                create_json_response(
                    data=proposed_actions_data,
                    status=200,
                    message="Proposed Actions found",
                ),
                content_type="application/json;charset=utf-8",
                status=200,
            )

        except Exception as e:
            _logger.error("Error getting proposed actions: %s", str(e))
            return Response(
                create_json_response(
                    data=[],
                    status=404,
                    message=str(e),
                ),
                content_type="application/json;charset=utf-8",
                status=404,
            )

    @route(
        "/api/v1/sevri/proposed-actions/<int:proposed_action_id>",
        type="http",
        auth="public",
        methods=["GET"],
        csrf=False,
    )
    def get_proposed_action(self, proposed_action_id, **kwargs):
        try:
            proposed_actions = self.proposed_action_service.get_proposed_actions() or []
            proposed_action = next(
                (pa for pa in proposed_actions if pa["id"] == proposed_action_id),
                None,
            )

            if not proposed_action:
                return Response(
                    create_json_response(
                        data=[],
                        status=404,
                        message="Proposed Action not found",
                    ),
                    content_type="application/json;charset=utf-8",
                    status=404,
                )

            return Response(
                create_json_response(
                    data=proposed_action,
                    status=200,
                    message="Proposed Action found",
                ),
                content_type="application/json;charset=utf-8",
                status=200,
            )

        except Exception as e:
            _logger.error(
                "Error getting proposed action %s: %s",
                proposed_action_id,
                str(e),
            )
            return Response(
                create_json_response(
                    data=[],
                    status=404,
                    message=str(e),
                ),
                content_type="application/json;charset=utf-8",
                status=404,
            )

    @route(
        "/api/v1/sevri/proposed-actions",
        type="http",
        auth="public",
        methods=["POST"],
        csrf=False,
    )
    def post_proposed_action(self, **kwargs):
        try:
            data = json.loads(request.httprequest.data)
        except ValueError:
            return Response(
                json.dumps({"error": "Invalid JSON"}),
                content_type="application/json;charset=utf-8",
                status=400,
            )

        if not data:
            return Response(
                json.dumps({"error": "Empty JSON"}),
                content_type="application/json;charset=utf-8",
                status=400,
            )

        proposed_action = self.proposed_action_service.post_proposed_action(data)
        return Response(
            json.dumps(proposed_action),
            content_type="application/json;charset=utf-8",
            status=201,
        )

    @route(
        "/api/v1/sevri/proposed-actions/<int:proposed_action_id>",
        type="http",
        auth="public",
        methods=["PUT"],
        csrf=False,
    )
    def update_proposed_action(self, proposed_action_id, **kwargs):
        try:
            data = json.loads(request.httprequest.data)
        except ValueError:
            return Response(
                json.dumps({"error": "Invalid JSON"}),
                content_type="application/json;charset=utf-8",
                status=400,
            )

        if not data:
            return Response(
                json.dumps({"error": "Empty JSON"}),
                content_type="application/json;charset=utf-8",
                status=400,
            )

        proposed_action = self.proposed_action_service.update_proposed_action(
            proposed_action_id, **data
        )

        return Response(
            create_json_response(
                data=proposed_action,
                status=200,
                message="Proposed Action updated",
            ),
            content_type="application/json;charset=utf-8",
            status=200,
        )