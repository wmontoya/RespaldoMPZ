import unittest
from utils.entity_validations import validate_purchase_orders_ebi
from tests.utils.test_report_helper import append_test_form


class TestPurchaseOrdersEbiValidation(unittest.TestCase):
    def test_valid_purchase_orders_ebi(self):
        value = "EBI0001"
        result = validate_purchase_orders_ebi(value)
        self.assertEqual(result, value)
        append_test_form(
            test_id="purchase_orders_ebi_valid",
            module="purchase_orders_ebi",
            name="test_valid_purchase_orders_ebi",
            status="PASS",
            data={"purchase_orders_ebi": value},
            pasos=[
                {
                    "Paso": "Validar orden de compra EBI válida",
                    "Entrada": f"purchase_orders_ebi={value}",
                    "Resultado esperado": f"Retorna {value}",
                    "Resultado real": f"Retorna {result}",
                    "Estado": "PASS",
                }
            ],
        )

    def test_empty_purchase_orders_ebi(self):
        value = ""
        with self.assertRaises(ValueError):
            validate_purchase_orders_ebi(value)
        append_test_form(
            test_id="purchase_orders_ebi_empty",
            module="purchase_orders_ebi",
            name="test_empty_purchase_orders_ebi",
            status="PASS",
            data={"purchase_orders_ebi": value},
            pasos=[
                {
                    "Paso": "Validar orden de compra EBI vacía",
                    "Entrada": f"purchase_orders_ebi={value}",
                    "Resultado esperado": "ValueError",
                    "Resultado real": "ValueError",
                    "Estado": "PASS",
                }
            ],
        )


if __name__ == "__main__":
    unittest.main()
