import unittest
from utils.entity_validations import validate_route
from tests.utils.test_report_helper import append_test_form


class TestRoutesValidation(unittest.TestCase):
    def test_valid_route(self):
        name = "Ruta 1"
        result = validate_route(name)
        self.assertEqual(result, name)
        append_test_form(
            test_id="routes_valid_name",
            module="routes",
            name="test_valid_route",
            status="PASS",
            data={"name": name},
            pasos=[
                {
                    "Paso": "Validar nombre de ruta válido",
                    "Entrada": f"name='{name}'",
                    "Resultado esperado": f"Retorna '{name}'",
                    "Resultado real": f"Retorna '{result}'",
                    "Estado": "PASS",
                }
            ],
        )

    def test_empty_route(self):
        name = ""
        with self.assertRaises(ValueError):
            validate_route(name)
        append_test_form(
            test_id="routes_empty_name",
            module="routes",
            name="test_empty_route",
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
