import os
import sys
import unittest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
from utils.payment_methods_validation import validate_payment_method_name
from tests.utils.test_report_helper import append_test_form


class TestPaymentMethodValidation(unittest.TestCase):
    def test_valid_payment_method_name(self):
        name = "Tarjeta"
        result = validate_payment_method_name(name)
        self.assertEqual(result, name)
        append_test_form(
            test_id="payment_methods_valid_name",
            module="payment_methods",
            name="test_valid_payment_method_name",
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

    def test_empty_payment_method_name(self):
        name = ""
        with self.assertRaises(ValueError):
            validate_payment_method_name(name)
        append_test_form(
            test_id="payment_methods_empty_name",
            module="payment_methods",
            name="test_empty_payment_method_name",
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
