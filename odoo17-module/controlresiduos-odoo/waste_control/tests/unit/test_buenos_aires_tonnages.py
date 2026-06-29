import unittest
from utils.entity_validations import validate_buenos_aires_tonnages
from tests.utils.test_report_helper import append_test_form


class TestBuenosAiresTonnagesValidation(unittest.TestCase):
    def test_valid_buenos_aires_tonnages(self):
        value = 7.2
        result = validate_buenos_aires_tonnages(value)
        self.assertTrue(result)
        append_test_form(
            test_id="buenos_aires_tonnages_valid",
            module="buenos_aires_tonnages",
            name="test_valid_buenos_aires_tonnages",
            status="PASS",
            data={"buenos_aires_tonnages": value},
            pasos=[
                {
                    "Paso": "Validar tonelaje válido",
                    "Entrada": f"buenos_aires_tonnages={value}",
                    "Resultado esperado": f"Retorna {value}",
                    "Resultado real": f"Retorna {result}",
                    "Estado": "PASS",
                }
            ],
        )

    def test_invalid_buenos_aires_tonnages(self):
        value = -3.0
        with self.assertRaises(ValueError):
            validate_buenos_aires_tonnages(value)
        append_test_form(
            test_id="buenos_aires_tonnages_invalid",
            module="buenos_aires_tonnages",
            name="test_invalid_buenos_aires_tonnages",
            status="PASS",
            data={"buenos_aires_tonnages": value},
            pasos=[
                {
                    "Paso": "Validar tonelaje inválido",
                    "Entrada": f"buenos_aires_tonnages={value}",
                    "Resultado esperado": "ValueError",
                    "Resultado real": "ValueError",
                    "Estado": "PASS",
                }
            ],
        )


if __name__ == "__main__":
    unittest.main()
