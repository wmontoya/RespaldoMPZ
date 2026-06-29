import unittest
from utils.entity_validations import validate_fuel_purchase
from tests.utils.test_report_helper import append_test_form


class TestFuelPurchaseOrdersValidation(unittest.TestCase):
    def test_valid_fuel_purchase(self):
        quantity = 50
        cost = 1000.0
        result = validate_fuel_purchase(quantity, cost)
        self.assertTrue(result)
        append_test_form(
            test_id="fuel_purchase_orders_valid",
            module="fuel_purchase_orders",
            name="test_valid_fuel_purchase",
            status="PASS",
            data={"quantity": quantity, "cost": cost},
            pasos=[
                {
                    "Paso": "Validar orden de compra de combustible válida",
                    "Entrada": f"quantity={quantity}, cost={cost}",
                    "Resultado esperado": f"Retorna ({quantity}, {cost})",
                    "Resultado real": f"Retorna {result}",
                    "Estado": "PASS",
                }
            ],
        )

    def test_invalid_fuel_purchase(self):
        quantity = -1
        cost = -100.0
        with self.assertRaises(ValueError):
            validate_fuel_purchase(quantity, cost)
        append_test_form(
            test_id="fuel_purchase_orders_invalid",
            module="fuel_purchase_orders",
            name="test_invalid_fuel_purchase",
            status="PASS",
            data={"quantity": quantity, "cost": cost},
            pasos=[
                {
                    "Paso": "Validar orden de compra de combustible inválida",
                    "Entrada": f"quantity={quantity}, cost={cost}",
                    "Resultado esperado": "ValueError",
                    "Resultado real": "ValueError",
                    "Estado": "PASS",
                }
            ],
        )


if __name__ == "__main__":
    unittest.main()
