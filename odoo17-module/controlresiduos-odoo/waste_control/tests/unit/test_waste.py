import unittest
from utils.entity_validations import validate_waste
from tests.utils.test_report_helper import append_test_form


class TestWasteValidation(unittest.TestCase):
    def test_valid_waste(self):
        value = 15.0
        result = validate_waste(value)
        self.assertTrue(result)
        append_test_form(
            test_id="waste_valid",
            module="waste",
            name="test_valid_waste",
            status="PASS",
            data={"waste": value},
            pasos=[
                {
                    "Paso": "Validar residuo válido",
                    "Entrada": f"waste={value}",
                    "Resultado esperado": f"Retorna {value}",
                    "Resultado real": f"Retorna {result}",
                    "Estado": "PASS",
                }
            ],
        )

    def test_invalid_waste(self):
        value = -2.0
        with self.assertRaises(ValueError):
            validate_waste(value)
        append_test_form(
            test_id="waste_invalid",
            module="waste",
            name="test_invalid_waste",
            status="PASS",
            data={"waste": value},
            pasos=[
                {
                    "Paso": "Validar residuo inválido",
                    "Entrada": f"waste={value}",
                    "Resultado esperado": "ValueError",
                    "Resultado real": "ValueError",
                    "Estado": "PASS",
                }
            ],
        )


if __name__ == "__main__":
    unittest.main()
