import unittest
from utils.entity_validations import validate_private_companies
from tests.utils.test_report_helper import append_test_form


class TestPrivateCompaniesValidation(unittest.TestCase):
    def test_valid_private_companies(self):
        value = "TrashCorp"
        result = validate_private_companies(value)
        self.assertEqual(result, value)
        append_test_form(
            test_id="private_companies_valid",
            module="private_companies",
            name="test_valid_private_companies",
            status="PASS",
            data={"private_companies": value},
            pasos=[
                {
                    "Paso": "Validar empresa privada válida",
                    "Entrada": f"private_companies={value}",
                    "Resultado esperado": f"Retorna {value}",
                    "Resultado real": f"Retorna {result}",
                    "Estado": "PASS",
                }
            ],
        )

    def test_empty_private_companies(self):
        value = ""
        with self.assertRaises(ValueError):
            validate_private_companies(value)
        append_test_form(
            test_id="private_companies_empty",
            module="private_companies",
            name="test_empty_private_companies",
            status="PASS",
            data={"private_companies": value},
            pasos=[
                {
                    "Paso": "Validar empresa privada vacía",
                    "Entrada": f"private_companies={value}",
                    "Resultado esperado": "ValueError",
                    "Resultado real": "ValueError",
                    "Estado": "PASS",
                }
            ],
        )


if __name__ == "__main__":
    unittest.main()
