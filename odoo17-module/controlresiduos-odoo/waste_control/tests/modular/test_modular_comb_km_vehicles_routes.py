import os
import sys
import unittest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from utils.entity_validations import (
    validate_fuel_purchase,
    validate_kilometers_traveled,
    validate_historic_vehicle,
)
from tests.utils.test_report_helper import append_test_form


class TestModularCombKmVehiclesRoutes(unittest.TestCase):
    def test_comb_km_and_vehicles_routes_integration(self):
        module = "modular_comb_km_vehicles_routes"
        test_name = "test_comb_km_and_vehicles_routes_integration"

        quantity = 50
        cost = 1000.0
        kilometers = 250.0
        vehicle_id = 1
        meter = 12345

        result_fuel_purchase = validate_fuel_purchase(quantity, cost)
        result_km = validate_kilometers_traveled(kilometers)
        result_historic = validate_historic_vehicle(vehicle_id, meter)

        self.assertTrue(result_fuel_purchase)
        self.assertTrue(result_km)
        self.assertTrue(result_historic)

        append_test_form(
            test_id="modular_comb_km_vehicles_routes",
            module=module,
            name=test_name,
            status="PASS",
            data={
                "fuel_purchase": result_fuel_purchase,
                "kilometers": result_km,
                "historic_vehicle": result_historic,
            },
            pasos=[
                {
                    "Paso": "Validar integración comb_km + vehicles_routes",
                    "Entrada": "fuel_purchase + kilometers + historic_vehicle",
                    "Resultado esperado": "Todas devuelven valores válidos",
                    "Resultado real": "Todas devuelven valores válidos",
                    "Estado": "PASS",
                }
            ],
        )


if __name__ == "__main__":
    unittest.main()
