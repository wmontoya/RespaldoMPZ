# -*- coding: utf-8 -*-
import json
import logging
from odoo.http import Controller, Response, request, route
from ..services.event_service import EventService

_logger = logging.getLogger(__name__)

class EventController(Controller):
    @route(
        "/api/v1/sevri/events/<int:event_id>",
        type="http",
        auth="public",
        methods=["DELETE"],
        csrf=False,
    )
    def delete_event(self, **kwargs):
        event_id = kwargs.get("event_id")
        event = EventService.delete_event(event_id)
        if event:
            return Response(
                json.dumps(event),
                content_type="application/json;charset=utf-8",
                status=200,
            )
        else:
            return request.not_found()
    @route(
        "/api/v1/sevri/events",
        type="http",
        auth="public",
        methods=["GET"],
        csrf=False,
    )
    def get_events(self, **kwargs):
        events = EventService.get_events()
        if events:
            return Response(
                json.dumps(events),
                content_type="application/json;charset=utf-8",
                status=200,
            )
        else:
            return request.not_found()
    
    @route(
        "/api/v1/sevri/events/<int:event_id>",
        type="http",
        auth="public",
        methods=["GET"],
        csrf=False,
    )
    def get_event(self, event_id, **kwargs):
        events = EventService.get_events()
        if events:
            event = [
                event for event in events if event["id"] == event_id
            ]
            if event:
                return Response(
                    json.dumps(event[0]),
                    content_type="application/json;charset=utf-8",
                    status=200,
                )
            else:
                return request.not_found()
        else:
            return request.not_found()
    
    @route(
        "/api/v1/sevri/events",
        type="http",
        auth="public",
        methods=["POST"],
        csrf=False,
    )
    def post_event(self, **kwargs):
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
                json.dumps({"error": "Empty data"}),
                content_type="application/json;charset=utf-8",
                status=400,
            )
        
        event = EventService.post_event(**data)
        return Response(
            json.dumps(event),
            content_type="application/json;charset=utf-8",
            status=201,
        )
    
    @route(
        "/api/v1/sevri/events/<int:event_id>",
        type="http",
        auth="public",
        methods=["PUT"],
        csrf=False,
    )
    def update_event(self, event_id, **kwargs):
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
                json.dumps({"error": "Empty data"}),
                content_type="application/json;charset=utf-8",
                status=400,
            )
        
        event = EventService.update_event(event_id, **data)
        return Response(
            json.dumps(event),
            content_type="application/json;charset=utf-8",
            status=200,
        )