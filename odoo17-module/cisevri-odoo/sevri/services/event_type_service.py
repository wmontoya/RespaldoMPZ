import json
import logging
from odoo.http import request
from datetime import date, datetime

_logger = logging.getLogger(__name__)

def date_to_string(value):
    if not value:
        return None
    if isinstance(value, (date, datetime)):
        return value.strftime("%Y-%m-%d")
    return str(value)

class EventTypeService:
    @staticmethod
    def get_event_types(**kwargs):
        event_types = request.env["sev.event_type"].sudo().search([])
        _logger.info("Event Types: %s", event_types)
        if event_types:
            event_types_res = []
            for event_type in event_types:
                event_types_res.append(
                    {
                        "id": event_type.id,
                        "name": event_type.name,
                        "classifications":  EventTypeService.parse_classifications(event_type.classifications),
                    }
                )
            return event_types_res
        else:
            return None
    @staticmethod
    def parse_classifications(classifications):
        return [EventTypeService._parse_single_classification(classification) for classification in classifications] 
    
    @staticmethod
    def _parse_single_classification(classification):
        return {
            "id": classification.id,
            "description": classification.description,
            "event_type_id": classification.event_type_id.id,
            "specifications":  EventTypeService.parse_specifications(classification.specifications),
        }
    @staticmethod
    def parse_specifications(specifications):
        return [EventTypeService._parse_single_specification(specification) for specification in specifications]
    @staticmethod
    def _parse_single_specification(specification):
        return {
            "id": specification.id,
            "description": specification.description,
            "classification_id": specification.classification_id.id,
        }
    
    @staticmethod
    def post_proposed_action(**kwargs):
        proposed_action = request.env["sev.proposed_action"].sudo().create(kwargs)
        return {
            "id": proposed_action.id,
            "event_id": proposed_action.event_id.id,
            "description": proposed_action.description,
            "indicators": proposed_action.indicators,
            "responsible_name": proposed_action.responsible_name,
            "responsible_email": proposed_action.responsible_email,
            "accomplishment_level": proposed_action.accomplishment_level,
            "justification": proposed_action.justification,
            "action_date": date_to_string(proposed_action.action_date),
        }
    
    @staticmethod
    def update_proposed_action(proposed_action_id, **kwargs):
        proposed_action = request.env["sev.proposed_action"].sudo().browse(proposed_action_id)
        if not proposed_action:
            return request.not_found()

        proposed_action.write(kwargs)
        return {
            "id": proposed_action.id,
            "event_id": proposed_action.event_id.id,
            "description": proposed_action.description,
            "indicators": proposed_action.indicators,
            "responsible_name": proposed_action.responsible_name,
            "responsible_email": proposed_action.responsible_email,
            "accomplishment_level": proposed_action.accomplishment_level,
            "justification": proposed_action.justification,
            "action_date": date_to_string(proposed_action.action_date),
        }