import logging
from datetime import date, datetime

_logger = logging.getLogger(__name__)

def date_to_string(value):
    if not value:
        return None
    if isinstance(value, (date, datetime)):
        return value.strftime("%Y-%m-%d")
    return str(value)


class ProposedActionService:
    def __init__(self, request):
        self.request = request

    def _format_proposed_action(self, proposed_action):
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
            "indicators": proposed_action.indicators,
            "responsible_name": proposed_action.responsible_name,
            "responsible_email": proposed_action.responsible_email,
            "accomplishment_level": proposed_action.accomplishment_level,
            "justification": proposed_action.justification,
            "observations": proposed_action.observations,
            "attachments": attachments_data,
            "action_date": date_to_string(proposed_action.action_date),
        }

    def _format_proposed_actions(self, proposed_actions):
        return [self._format_proposed_action(action) for action in proposed_actions]

    def get_proposed_actions(self, **kwargs):
        proposed_actions = self.request.env["sev.proposed_action"].sudo().search([])
        _logger.info("Proposed Actions: %s", proposed_actions)

        if proposed_actions:
            return [self._format_proposed_action(action) for action in proposed_actions]
        return None

    def post_proposed_action(self, action_data):
        attachments_data = action_data.pop("attachments", [])

        proposed_action = (
            self.request.env["sev.proposed_action"].sudo().create(action_data)
        )

        for attachment in attachments_data:
            attachment["proposed_action_id"] = proposed_action.id
            self.request.env["sev.attachment"].sudo().create(attachment)

        return self._format_proposed_action(proposed_action)

    def post_proposed_actions(self, actions):
        created_actions = []
        if len(actions) > 0:
            self.request.env["sev.proposed_action"].sudo().search(
                [("event_id", "=", actions[0]["event_id"])]
            ).unlink()
        for action_data in actions:
            _logger.info(f"Action Data: {action_data}")
            created_actions.append(self.post_proposed_action(action_data))
        return created_actions

    def update_proposed_action(self, proposed_action_id, **kwargs):
        proposed_action = self.request.env["sev.proposed_action"].sudo().browse(proposed_action_id)
        if not proposed_action:
            return None

        attachments_data = kwargs.pop("attachments", [])

        existing_attachments = self.request.env["sev.attachment"].sudo().search(
            [('proposed_action_id', '=', proposed_action.id)]
        )
        existing_attachments.unlink()

        proposed_action.write(kwargs)

        for attachment_data in attachments_data:
            attachment_id = attachment_data.get("id")
            if attachment_id:
                attachment = self.request.env["sev.attachment"].sudo().browse(attachment_id)
                if attachment and attachment.proposed_action_id.id == proposed_action.id:
                    attachment.write(attachment_data)
            else:
                attachment_data["proposed_action_id"] = proposed_action.id
                self.request.env["sev.attachment"].sudo().create(attachment_data)

        return self._format_proposed_action(proposed_action)