import unittest
from utils.entity_validations import validate_kilometers_traveled
from tests.utils.test_report_helper import append_test_form


class TestKilometersTraveledValidation(unittest.TestCase):
    def test_valid_kilometers(self):
        km = 250.0
        result = validate_kilometers_traveled(km)
        self.assertTrue(result)
        append_test_form(
            test_id="kilometers_traveled_valid",
            module="kilometers_traveled",
            name="test_valid_kilometers",
            status="PASS",
            data={"kilometers": km},
            pasos=[
                {
                    "Paso": "Validar kilometraje válido",
                    "Entrada": f"kilometers={km}",
                    "Resultado esperado": f"Retorna {km}",
                    "Resultado real": f"Retorna {result}",
                    "Estado": "PASS",
                }
            ],
        )

    def test_invalid_kilometers(self):
        km = -10.0
        with self.assertRaises(ValueError):
            validate_kilometers_traveled(km)
        append_test_form(
            test_id="kilometers_traveled_invalid",
            module="kilometers_traveled",
            name="test_invalid_kilometers",
            status="PASS",
            data={"kilometers": km},
            pasos=[
                {
                    "Paso": "Validar kilometraje inválido",
                    "Entrada": f"kilometers={km}",
                    "Resultado esperado": "ValueError",
                    "Resultado real": "ValueError",
                    "Estado": "PASS",
                }
            ],
        )


if __name__ == "__main__":
    unittest.main()
