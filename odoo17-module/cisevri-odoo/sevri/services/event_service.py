import json
import logging
from odoo.http import request
from .proposed_action_service import ProposedActionService
from datetime import date, datetime

_logger = logging.getLogger(__name__)

def date_to_string(value):
    if not value:
        return None
    if isinstance(value, (date, datetime)):
        return value.strftime("%Y-%m-%d")
    return str(value)

class EventService:
    @staticmethod
    def _format_event(event):
        return {
            "id": event.id,
            "description": event.description,
            "causes": event.causes,
            "consequences": event.consequences,
            "event_type_id": event.event_type_id.id if event.event_type_id else None,
            "event_classification_id": (
                event.event_classification_id.id
                if event.event_classification_id
                else None
            ),
            "event_specification_id": (
                event.event_specification_id.id
                if event.event_specification_id
                else None
            ),
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
            "proposed_actions": EventService.parse_proposed_actions(
                event.proposed_actions
            ),
        }

    @staticmethod
    def delete_event(event_id):
        _logger.info("Event ID: %s", event_id)
        event = request.env["sev.event"].sudo().search([("id", "=", event_id)])
        if not event:
            return request.not_found()
        _logger.info("Event: %s", event)
        request.env["sev.proposed_action"].sudo().search(
            [("event_id", "=", event_id)]
        ).unlink()
        event.unlink()
        return {"message": "Event deleted successfully", "id": event_id}

    @staticmethod
    def post_event(**kwargs):
        proposed_actions = kwargs.pop("proposed_actions", [])
        event = request.env["sev.event"].sudo().create(kwargs)
        created_proposed_actions = []
        for action in proposed_actions:
            action["event_id"] = event.id
            created_action = request.env["sev.proposed_action"].sudo().create(action)
            created_proposed_actions.append(
                {
                    "id": created_action.id,
                    "event_id": created_action.event_id.id,
                    "description": created_action.description,
                    "responsible_name": created_action.responsible_email,
                    "responsible_email": created_action.responsible_email,
                    "indicators": created_action.indicators,
                    "justification": created_action.justification,
                    "accomplishment_level": created_action.accomplishment_level,
                    "action_date": date_to_string(created_action.action_date),
                }
            )

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
            "proposed_actions": created_proposed_actions,
        }

    @staticmethod
    def update_event(event_id, **kwargs):
        event = request.env["sev.event"].sudo().browse(event_id)
        if not event:
            return request.not_found()
        event.proposed_actions.unlink()
        proposed_actions = kwargs.pop("proposed_actions", [])
        created_proposed_actions = []
        for action in proposed_actions:
            updated_action = (
                request.env["sev.proposed_action"]
                .sudo()
                .create({"event_id": event.id, **action})
            )
            created_proposed_actions.append(
                {
                    "id": updated_action.id,
                    "event_id": updated_action.event_id.id,
                    "description": updated_action.description,
                    "responsible_name": updated_action.responsible_email,
                    "responsible_email": updated_action.responsible_email,
                    "indicators": updated_action.indicators,
                    "justification": updated_action.justification,
                    "accomplishment_level": updated_action.accomplishment_level,
                    "action_date": date_to_string(updated_action.action_date),
                }
            )

        # _logger.info("Event: %s", kwargs)
        event_updated = event.sudo().write(kwargs)
        _logger.info("Event Updated: %s", event_updated)
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
            "proposed_actions": created_proposed_actions,
        }

    @staticmethod
    def get_events(**kwargs):
        events = request.env["sev.event"].sudo().search([])
        proposed_actions = ProposedActionService(request).get_proposed_actions()
        if events:
            events_res = []
            for event in events:
                _logger.info("Event: %s", event)
                events_res.append(
                    {
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
                        "proposed_actions": (
                            []
                            if proposed_actions is None
                            else [
                                proposed_action
                                for proposed_action in proposed_actions
                                if proposed_action["event_id"] == event.id
                            ]
                        ),
                    }
                )
            return events_res
        else:
            return None

    @staticmethod
    def parse_proposed_actions(proposed_actions):
        return [
            EventService._parse_single_proposed_action(proposed_action)
            for proposed_action in proposed_actions
        ]

    @staticmethod
    def _parse_single_proposed_action(proposed_action):
        attachments_data = []
        for attachment in proposed_action.attachments:
            attachments_data.append(
                {
                    "id": attachment.id,
                    "name": attachment.name,
                    "attachment": (
                        attachment.attachment.decode("utf-8")
                        if attachment.attachment
                        else None
                    ),
                    "attachment_type": attachment.attachment_type,
                    "description": attachment.description,
                }
            )
        
        return {
            "id": proposed_action.id,
            "event_id": proposed_action.event_id.id,
            "description": proposed_action.description,
            "responsible_name": proposed_action.responsible_name,
            "responsible_email": proposed_action.responsible_email,
            "indicators": proposed_action.indicators,
            "justification": proposed_action.justification,
            "accomplishment_level": proposed_action.accomplishment_level,
            "action_date": date_to_string(proposed_action.action_date),
            "observations": proposed_action.observations,
            "attachments": attachments_data,
            # "attachment_name": proposed_action.attachment_name,
            # "attachment_type": proposed_action.attachment_type,
        }
