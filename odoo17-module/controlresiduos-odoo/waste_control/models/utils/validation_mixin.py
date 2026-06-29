from odoo import models, api, _
from odoo.exceptions import ValidationError
from .warning_type import WarningType


class ValidationMixin(models.AbstractModel):
    """Mixin to add advanced field validation capabilities to Odoo models"""

    _name = "waste_control.validation_mixin"
    _description = "Mezcla de Validación de Campo"

    def _create_warning(
        self,
        title,
        message,
        fields=None,
        field_messages=None,
        warning_type=WarningType.DANGER,
        duration=6000,
    ):
        """Helper method to create a warning with custom title and message

        Args:
            title (str): The title of the warning
            message (str): The main message
            fields (list, optional): List of field names that have issues
            field_messages (dict, optional): Dictionary with field names as keys and specific error messages as values
            warning_type (WarningType, optional): Type of warning (DANGER, WARNING, INFO, SUCCESS)
            duration (int, optional): Duration in milliseconds the warning should be displayed

        Returns:
            dict: Warning dictionary to be returned from onchange methods with fields to highlight
        """
        formatted_message = message

        # If fields are provided, add them as bullet points
        if fields and isinstance(fields, (list, tuple)) and len(fields) > 0:
            formatted_message += "\n\n"

            for field in fields:
                field_label = (
                    self._fields.get(field).string if field in self._fields else field
                )

                # Add specific message for the field if available
                if field_messages and field in field_messages:
                    formatted_message += f"• {field_label}: {field_messages[field]}\n"
                else:
                    formatted_message += f"• {field_label}\n"

        return {
            "warning": {
                "title": _(title),
                "message": _(formatted_message),
                "type": warning_type.value,
                "sticky": False,
                "duration": duration,
            }
        }

    def validate_fields(self, validation_rules=None, as_constraint=False):
        """Validate fields according to specified rules

        Args:
            validation_rules (dict): Dictionary of field validations in format:
                {
                    'field_name': {
                        'condition': lambda self, value: bool,  # Validation function
                        'message': 'Error message',  # Message to display if validation fails
                        'required_if': lambda self: bool,  # Function to determine if field is conditionally required
                        'required_message': 'Field is required when...',  # Message when conditionally required
                        'depends_on': ['other_field'],  # Fields that this validation depends on
                    }
                }
            as_constraint (bool): If True, raises ValidationError instead of returning warning dict

        Returns:
            dict: Warning dictionary or empty dict if all validations pass

        Raises:
            ValidationError: If as_constraint is True and validations fail
        """
        if validation_rules is None:
            validation_rules = self._get_validation_rules()

        if not validation_rules:
            return {}

        invalid_fields = []
        field_messages = {}

        # Check each validation rule
        for field, rules in validation_rules.items():
            field_value = self[field]

            # Skip validations for fields that aren't in the model
            if field not in self._fields:
                continue

            # Check if field is conditionally required
            if (
                "required_if" in rules
                and callable(rules["required_if"])
                and rules["required_if"](self)
            ):
                if not field_value:
                    invalid_fields.append(field)
                    field_messages[field] = rules.get(
                        "required_message", _("Este campo es requerido")
                    )
                    continue

            # Skip empty values if not required
            if not field_value and not rules.get("validate_empty", False):
                continue

            # Apply validation condition
            if "condition" in rules and callable(rules["condition"]):
                if not rules["condition"](self, field_value):
                    invalid_fields.append(field)
                    field_messages[field] = rules.get("message", _("Valor invalido"))

        # If there are invalid fields
        if invalid_fields:
            if as_constraint:
                # Format error message for ValidationError
                error_msg = _("Por favor corrija los siguientes errores:\n\n")
                for field in invalid_fields:
                    field_label = self._fields[field].string
                    error_msg += f"• {field_label}: {field_messages[field]}\n"
                raise ValidationError(error_msg)
            else:
                # Return warning for UI
                return self._create_warning(
                    title=_("Error de validación"),
                    message=_("Revisa los campos:"),
                    fields=invalid_fields,
                    field_messages=field_messages,
                )

        return {}

    def _get_validation_rules(self):
        """Override this method in models to define validation rules

        Returns:
            dict: Dictionary of validation rules
        """
        return {}

    @api.onchange("*")
    def _onchange_validate_all_fields(self):
        """Validates all fields on any field change"""
        return self.validate_fields()
