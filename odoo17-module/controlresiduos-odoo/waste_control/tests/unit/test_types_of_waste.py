import os
import sys
import unittest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
from utils.types_of_waste_validation import validate_type_of_waste_name
from tests.utils.test_report_helper import append_test_form


class TestTypeOfWasteValidation(unittest.TestCase):
    def test_valid_type_of_waste_name(self):
        name = "Plástico"
        result = validate_type_of_waste_name(name)
        self.assertEqual(result, name)
        append_test_form(
            test_id="types_of_waste_valid_name",
            module="types_of_waste",
            name="test_valid_type_of_waste_name",
            status="PASS",
            data={"name": name},
            pasos=[
                {
                    "Paso": "Validar nombre válido",
                    "Entrada": f"name='{name}'",
                    "Resultado esperado": f"Retorna '{name}'",
                    "Resultado real": f"Retorna '{result}'",
                    "Estado": "PASS",
                }
            ],
        )

    def test_empty_type_of_waste_name(self):
        name = ""
        with self.assertRaises(ValueError):
            validate_type_of_waste_name(name)
        append_test_form(
            test_id="types_of_waste_empty_name",
            module="types_of_waste",
            name="test_empty_type_of_waste_name",
            status="PASS",
            data={"name": name},
            pasos=[
                {
                    "Paso": "Validar nombre vacío",
                    "Entrada": f"name='{name}'",
                    "Resultado esperado": "ValueError",
                    "Resultado real": "ValueError",
                    "Estado": "PASS",
                }
            ],
        )


if __name__ == "__main__":
    unittest.main()
