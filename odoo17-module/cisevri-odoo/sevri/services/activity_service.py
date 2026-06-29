import logging
from odoo.http import request
from .event_service import EventService
from datetime import date, datetime

_logger = logging.getLogger(__name__)

def date_to_string(value):
    if not value:
        return None
    if isinstance(value, (date, datetime)):
        return value.strftime("%Y-%m-%d")
    return str(value)

class ActivityService:
    @staticmethod
    def _format_activity(activity):
        return {
            "id": activity.id,
            "title": activity.title,
            "subtitle": activity.subtitle,
            "activity_date": date_to_string(activity.activity_date),
            "dependency": activity.dependency,
            "procedure_to_follow": activity.procedure_to_follow,
            "department_id": (
                activity.department_id.id if activity.department_id else None
            ),
            "events": [EventService._format_event(event) for event in activity.events],
        }
    @staticmethod
    def parse_activities(activities):
        return [ActivityService._format_activity(activity) for activity in activities]
    @staticmethod
    def delete_activity(activity_id):
        activity = request.env["sev.activity"].sudo().browse(activity_id)
        if not activity:
            return None
        for event in activity.events:
            event.proposed_actions.unlink()
            event.unlink()
        activity.unlink()
        return {
            "id": activity.id,
            "title": activity.title,
            "subtitle": activity.subtitle,
            "activity_date": date_to_string(activity.activity_date),
            "dependency": activity.dependency,
            "procedure_to_follow": activity.procedure_to_follow,
            "department_id": activity.department_id.id,
            "events": [],
        }
    @staticmethod
    def post_activity(**kwargs):
        activity = request.env["sev.activity"].sudo().create(kwargs)
        return {
            "id": activity.id,
            "title": activity.title,
            "subtitle": activity.subtitle,
            "activity_date": date_to_string(activity.activity_date),
            "dependency": activity.dependency,
            "procedure_to_follow": activity.procedure_to_follow,
            "department_id": activity.department_id.id,
            "events": [],
        }

    @staticmethod
    def update_activity(activity_id, **kwargs):
        activity = request.env["sev.activity"].sudo().browse(activity_id)
        if not activity:
            return request.not_found()

        activity.write(kwargs)
        return {
            "id": activity.id,
            "title": activity.title,
            "subtitle": activity.subtitle,
            "activity_date": date_to_string(activity.activity_date),
            "dependency": activity.dependency,
            "procedure_to_follow": activity.procedure_to_follow,
            "department_id": activity.department_id.id,
            "events": ActivityService.parse_events(activity.events),
            # "events": activity.events,
        }

    @staticmethod
    def parse_events(events):
        return [ActivityService._parse_single_event(event) for event in events]

    @staticmethod
    def _parse_single_event(event):
        _logger.info("Event: %s", event)
        return {
            "id": event.id,
            "activity_id": event.activity_id.id,
            "description": event.description,
            "causes": event.causes,
            "consequences": event.consequences,
            "event_type_id": event.event_type_id.id,
            "event_classification_id": event.event_classification_id.id,
            "event_specification_id": event.event_specification_id.id,
            "probability": event.probability,
            "impact": event.impact,
            "risk_level": event.risk_level,
            "existent_control_measures": event.existent_control_measures,
            "actitude": event.actitude,
            "aptitude": event.aptitude,
            "new_risk_level": event.new_risk_level,
            "acceptance": event.acceptance,
            "creation_date": date_to_string(event.creation_date),
            "last_update": date_to_string(event.last_update),
            "status": event.status,
            "proposed_actions": EventService.parse_proposed_actions(event.proposed_actions),
        }

    @staticmethod
    def get_activities(**kwargs):
        activities = request.env["sev.activity"].sudo().search([])
        _logger.info("Activities: %s", activities)

        events = EventService.get_events()

        if activities:
            activities_res = []
            if events is None:
                events = []
            else:
                events = events
            for activity in activities:
                activity_events = [
                    event for event in events if event["activity_id"] == activity.id
                ]
                activities_res.append(
                    {
                        "id": activity.id,
                        "title": activity.title,
                        "subtitle": activity.subtitle,
                        "activity_date": date_to_string(activity.activity_date),
                        "dependency": activity.dependency,
                        "procedure_to_follow": activity.procedure_to_follow,
                        "department_id": activity.department_id.id,
                        "events": activity_events,
                    }
                )
            return activities_res
        else:
            _logger.warning("No activities found")
            return None
