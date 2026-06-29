import logging
from ...shared.utils.date_util import date_to_string

import json

_logger = logging.getLogger(__name__)


class ProposedActionService:
    def __init__(self, request):
        self.request = request
        _logger.info("env", request.env["mm.proposed_action"].sudo().search([]))

    def _format_proposed_action(self, proposed_action):
        return {
            "id": proposed_action.id,
            "user_id": proposed_action.user_id.id,
            "evaluation_id": proposed_action.evaluation_id.id,
            "description": proposed_action.description,
            "indicators": proposed_action.indicators,
            "responsible_name": proposed_action.responsible_name,
            "responsible_email": proposed_action.responsible_email,
            "accomplishment_level": proposed_action.accomplishment_level,
            "justification": proposed_action.justification,
            "action_date": date_to_string(proposed_action.action_date),
            "observations": proposed_action.observations,
            "attachment": proposed_action.attachment.decode("utf-8") if proposed_action.attachment else None,
            "attachment_name": proposed_action.attachment_name,
            "attachment_type": proposed_action.attachment_type,
        }

    def get_proposed_actions(self, **kwargs):
        proposed_actions = self.request.env["mm.proposed_action"].sudo().search([])
        _logger.info("Proposed Actions: %s", proposed_actions)

        if proposed_actions:
            return [self._format_proposed_action(action) for action in proposed_actions]
        return None

    def post_proposed_action(self, actions):
        created_actions = []
        # evaluation_id = kwargs.get("evaluation_id")
        if len(actions) > 0:
            self.request.env["mm.proposed_action"].sudo().search(
                [("evaluation_id", "=", actions[0]["evaluation_id"])]
            ).unlink()
        for action_data in actions:
            _logger.info(f"Action Data: {action_data}")
            proposed_action = (
                self.request.env["mm.proposed_action"].sudo().create(action_data)
            )
            created_actions.append(self._format_proposed_action(proposed_action))
        return created_actions

    def update_proposed_action(self, proposed_action_id, **kwargs):
        proposed_action = (
            self.request.env["mm.proposed_action"].sudo().browse(proposed_action_id)
        )
        if not proposed_action:
            return None

        proposed_action.write(kwargs)
        return self._format_proposed_action(proposed_action)
