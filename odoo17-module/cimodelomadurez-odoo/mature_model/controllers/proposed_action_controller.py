import json
import logging
from odoo.http import Controller, Response, request, route
from ..services.proposed_action_service import ProposedActionService
from ...shared.utils.response import create_json_response

_logger = logging.getLogger(__name__)


class ProposedActionController(Controller):
    def __init__(self):
        super().__init__()
        self.proposed_action_service = ProposedActionService(request)

    @route(
        "/api/v1/mature-model/proposed-actions/<int:department_id>",
        type="http",
        auth="public",
        methods=["GET"],
        csrf=False,
    )
    def get_proposed_actions(self, department_id, **kwargs):
        try:
            evaluations = request.env["mm.evaluation"].sudo().search([('departments', 'in', [department_id])])
            proposed_actions = request.env["mm.proposed_action"].sudo().search([('evaluation_id', 'in', evaluations.ids)])
            proposed_actions_data = [self.proposed_action_service._format_proposed_action(action) for action in proposed_actions]
            return Response(
            create_json_response(data=proposed_actions_data, status=200),
            content_type="application/json;charset=utf-8",
            status=200,
            )
        except Exception as e:
            _logger.error(f"Error getting proposed actions: {str(e)}")
            return Response(
                create_json_response(data=[], status=404, message=str(e)),
                content_type="application/json;charset=utf-8",
                status=404,
            )

    @route(
        "/api/v1/mature-model/proposed-actions/byId/<int:proposed_action_id>",
        type="http",
        auth="public",
        methods=["GET"],
        csrf=False,
    )
    def get_proposed_action(self, proposed_action_id, **kwargs):
        try:
            proposed_actions = self.proposed_action_service.get_proposed_actions()
            proposed_action = next(
                (pa for pa in proposed_actions if pa["id"] == proposed_action_id), None
            )

            if not proposed_action:
                return Response(
                    # json.dumps({"error": "Proposed Action not found"}),
                    create_json_response(
                        data=[], status=404, message="Proposed Action not found"
                    ),
                    content_type="application/json;charset=utf-8",
                    status=404,
                )

            return Response(
                # json.dumps(proposed_action),
                create_json_response(data=proposed_action, status=200),
                content_type="application/json;charset=utf-8",
                status=200,
            )
        except Exception as e:
            _logger.error(
                f"Error getting proposed action {proposed_action_id}: {str(e)}"
            )
            return Response(
                # json.dumps({"error": "Proposed Actions not found"}),
                create_json_response(
                    data=[], status=404, message="Proposed Actions not found"
                ),
                content_type="application/json;charset=utf-8",
                status=404,
            )

    @route(
        "/api/v1/mature-model/proposed-actions",
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
        # _logger.info(f"Data: {data}")
        proposed_action = self.proposed_action_service.post_proposed_action(data)
        return Response(
            json.dumps(proposed_action),
            content_type="application/json;charset=utf-8",
            status=201,
        )

    @route(
        "/api/v1/mature-model/proposed-actions/<int:proposed_action_id>",
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
            create_json_response(data=proposed_action, status=200),
            content_type="application/json;charset=utf-8",
            status=200,
        )
