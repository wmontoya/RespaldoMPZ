# -*- coding: utf-8 -*-
import json
import logging
from odoo.http import Controller, Response, request, route
from ..services.activity_service import ActivityService

_logger = logging.getLogger(__name__)


class ActivityController(Controller):
    @route(
        "/api/v1/sevri/activities/<int:activity_id>",
        type="http",
        auth="public",
        methods=["DELETE"],
        csrf=False,
    )
    def delete_activity(self, **kwargs):
        activity_id = kwargs.get("activity_id")
        activity = ActivityService.delete_activity(activity_id)
        if activity:
            return Response(
                json.dumps(activity),
                content_type="application/json;charset=utf-8",
                status=200,
            )
        else:
            return request.not_found
    @route(
        "/api/v1/sevri/activities",
        type="http",
        auth="public",
        methods=["GET"],
        csrf=False,
    )
    def get_activities(self, **kwargs):
        activities = ActivityService.get_activities()
        if activities:
            return Response(
                json.dumps(activities),
                content_type="application/json;charset=utf-8",
                status=200,
            )
        else:
            return request.not_found()

    @route(
        "/api/v1/sevri/activities/<int:activity_id>",
        type="http",
        auth="public",
        methods=["GET"],
        csrf=False,
    )
    def get_activity(self, activity_id, **kwargs):
        activities = ActivityService.get_activities()
        if activities:
            activity = [
                activity for activity in activities if activity["id"] == activity_id
            ]
            if activity:
                return Response(
                    json.dumps(activity[0]),
                    content_type="application/json;charset=utf-8",
                    status=200,
                )
            else:
                return request.not_found()
        else:
            return request.not_found()

    @route(
        "/api/v1/sevri/activities",
        type="http",
        auth="public",
        methods=["POST"],
        csrf=False,
    )
    def post_activity(self, **kwargs):
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
                json.dumps({"error": "No data received"}),
                content_type="application/json;charset=utf-8",
                status=400,
            )

        activity = ActivityService.post_activity(**data)
        return Response(
            json.dumps(activity),
            content_type="application/json;charset=utf-8",
            status=201,
        )

    @route(
        "/api/v1/sevri/activities/<int:activity_id>",
        type="http",
        auth="public",
        methods=["PUT"],
        csrf=False,
    )
    def update_activity(self, activity_id, **kwargs):
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
                json.dumps({"error": "No data received"}),
                content_type="application/json;charset=utf-8",
                status=400,
            )

        activity = ActivityService.update_activity(activity_id, **data)
        if activity:
            return Response(
                json.dumps(activity),
                content_type="application/json;charset=utf-8",
                status=200,
            )
        else:
            return request.not_found()
