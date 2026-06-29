import unittest
from utils.entity_validations import validate_meat_waste
from tests.utils.test_report_helper import append_test_form


class TestMeatWasteValidation(unittest.TestCase):
    def test_valid_meat_waste(self):
        value = 10.5
        result = validate_meat_waste(value)
        self.assertTrue(result)
        append_test_form(
            test_id="meat_waste_valid",
            module="meat_waste",
            name="test_valid_meat_waste",
            status="PASS",
            data={"meat_waste": value},
            pasos=[
                {
                    "Paso": "Validar residuo cárnico válido",
                    "Entrada": f"meat_waste={value}",
                    "Resultado esperado": f"Retorna {value}",
                    "Resultado real": f"Retorna {result}",
                    "Estado": "PASS",
                }
            ],
        )

    def test_invalid_meat_waste(self):
        value = -1.0
        with self.assertRaises(ValueError):
            validate_meat_waste(value)
        append_test_form(
            test_id="meat_waste_invalid",
            module="meat_waste",
            name="test_invalid_meat_waste",
            status="PASS",
            data={"meat_waste": value},
            pasos=[
                {
                    "Paso": "Validar residuo cárnico inválido",
                    "Entrada": f"meat_waste={value}",
                    "Resultado esperado": "ValueError",
                    "Resultado real": "ValueError",
                    "Estado": "PASS",
                }
            ],
        )


if __name__ == "__main__":
    unittest.main()
