import os
import sys
import unittest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
from utils.entity_validations import (
    validate_contact_driver,
    validate_contact_responsible,
    validate_contact_squad,
    validate_contact_collection_center,
)
from tests.utils.test_report_helper import append_test_form


class TestContactValidation(unittest.TestCase):
    def test_valid_contacts(self):
        validate_contact_driver("Juan", "ABC123")
        validate_contact_responsible("Maria")
        validate_contact_squad("Grupo A")
        validate_contact_collection_center("Centro 1")
        append_test_form(
            test_id="contacts_valid",
            module="contacts",
            name="test_valid_contacts",
            status="PASS",
            data={
                "driver": "Juan",
                "license": "ABC123",
                "responsible": "Maria",
                "squad": "Grupo A",
                "collection_center": "Centro 1",
            },
            pasos=[
                {
                    "Paso": "Validar contactos",
                    "Entrada": "datos válidos",
                    "Resultado esperado": "Todo OK",
                    "Resultado real": "Todo OK",
                    "Estado": "PASS",
                }
            ],
        )


if __name__ == "__main__":
    unittest.main()
