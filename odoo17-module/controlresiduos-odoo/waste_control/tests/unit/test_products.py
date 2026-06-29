import unittest
from utils.entity_validations import validate_product
from tests.utils.test_report_helper import append_test_form


class TestProductValidation(unittest.TestCase):
    def test_valid_product(self):
        name = "Residuos Orgánicos"
        result = validate_product(name)
        self.assertEqual(result, name)
        append_test_form(
            test_id="products_valid_name",
            module="products",
            name="test_valid_product",
            status="PASS",
            data={"name": name},
            pasos=[
                {
                    "Paso": "Validar nombre de producto válido",
                    "Entrada": f"name='{name}'",
                    "Resultado esperado": f"Retorna '{name}'",
                    "Resultado real": f"Retorna '{result}'",
                    "Estado": "PASS",
                }
            ],
        )

    def test_empty_product(self):
        name = ""
        with self.assertRaises(ValueError):
            validate_product(name)
        append_test_form(
            test_id="products_empty_name",
            module="products",
            name="test_empty_product",
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
