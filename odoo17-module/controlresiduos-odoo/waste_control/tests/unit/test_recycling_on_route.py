import unittest
from utils.entity_validations import validate_recycling_on_route
from tests.utils.test_report_helper import append_test_form


class TestRecyclingOnRouteValidation(unittest.TestCase):
    def test_valid_recycling_on_route(self):
        value = 20
        result = validate_recycling_on_route(value)
        self.assertTrue(result)
        append_test_form(
            test_id="recycling_on_route_valid",
            module="recycling_on_route",
            name="test_valid_recycling_on_route",
            status="PASS",
            data={"recycling_on_route": value},
            pasos=[
                {
                    "Paso": "Validar reciclaje en ruta válido",
                    "Entrada": f"recycling_on_route={value}",
                    "Resultado esperado": f"Retorna {value}",
                    "Resultado real": f"Retorna {result}",
                    "Estado": "PASS",
                }
            ],
        )

    def test_invalid_recycling_on_route(self):
        value = -5
        with self.assertRaises(ValueError):
            validate_recycling_on_route(value)
        append_test_form(
            test_id="recycling_on_route_invalid",
            module="recycling_on_route",
            name="test_invalid_recycling_on_route",
            status="PASS",
            data={"recycling_on_route": value},
            pasos=[
                {
                    "Paso": "Validar reciclaje en ruta inválido",
                    "Entrada": f"recycling_on_route={value}",
                    "Resultado esperado": "ValueError",
                    "Resultado real": "ValueError",
                    "Estado": "PASS",
                }
            ],
        )


if __name__ == "__main__":
    unittest.main()
