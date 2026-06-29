import os
import sys
import unittest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from utils.entity_validations import (
    validate_route,
    validate_product,
    validate_recycle_program,
    validate_payment_method_name,
    validate_historic_vehicle,
    validate_fuel_purchase,
    validate_kilometers_traveled,
    validate_meat_waste,
    validate_recycling_on_route,
    validate_recycling_by_campaigns,
    validate_waste,
    validate_buenos_aires_tonnages,
    validate_purchase_orders_ebi,
    validate_private_companies,
    validate_communities_waste_reports,
)
from tests.utils.test_report_helper import append_test_form


class TestModularFullFlow(unittest.TestCase):
    def test_full_module_integration(self):
        module = "modular_full_flow"
        test_name = "test_full_module_integration"

        # Minor models
        route = "Ruta X"
        product = "Residuos ABC"
        recycle_program = "Programa ABC"
        payment_method = "Efectivo"

        # Vehicles/routes
        vehicle_id = 2
        meter = 5000

        # Combustible
        fuel_qty = 100
        fuel_cost = 2500.0
        km = 300.0

        # Waste management
        meat_waste = 5.0
        recycling_route = 10
        recycling_campaign = "Campaña XYZ"
        waste_amount = 20.0
        buenos_aires = 8.5
        ebi_order = "EBI123"
        private_company = "BioTrash"
        communities = ["Distrito 1", "Distrito 2"]

        # Validation calls
        self.assertEqual(validate_route(route), route)
        self.assertEqual(validate_product(product), product)
        self.assertEqual(validate_recycle_program(recycle_program), recycle_program)
        self.assertEqual(validate_payment_method_name(payment_method), payment_method)

        self.assertTrue(validate_historic_vehicle(vehicle_id, meter))
        self.assertTrue(validate_fuel_purchase(fuel_qty, fuel_cost))
        self.assertTrue(validate_kilometers_traveled(km))

        self.assertTrue(validate_meat_waste(meat_waste))
        self.assertTrue(validate_recycling_on_route(recycling_route))
        self.assertEqual(
            validate_recycling_by_campaigns(recycling_campaign), recycling_campaign
        )
        self.assertTrue(validate_waste(waste_amount))
        self.assertTrue(validate_buenos_aires_tonnages(buenos_aires))
        self.assertEqual(validate_purchase_orders_ebi(ebi_order), ebi_order)
        self.assertEqual(validate_private_companies(private_company), private_company)
        self.assertEqual(validate_communities_waste_reports(communities), communities)

        append_test_form(
            test_id="modular_full_flow",
            module=module,
            name=test_name,
            status="PASS",
            data={
                "route": route,
                "product": product,
                "recycle_program": recycle_program,
                "payment_method": payment_method,
                "vehicle_id": vehicle_id,
                "meter": meter,
                "fuel_qty": fuel_qty,
                "fuel_cost": fuel_cost,
                "km": km,
                "meat_waste": meat_waste,
                "recycling_route": recycling_route,
                "recycling_campaign": recycling_campaign,
                "waste_amount": waste_amount,
                "buenos_aires": buenos_aires,
                "ebi_order": ebi_order,
                "private_company": private_company,
                "communities": communities,
            },
            pasos=[
                {
                    "Paso": "Validar flujo completo e integración modular",
                    "Entrada": "values for minor_models + core modules",
                    "Resultado esperado": "Todas validaciones PASAN",
                    "Resultado real": "Todas validaciones PASAN",
                    "Estado": "PASS",
                }
            ],
        )


if __name__ == "__main__":
    unittest.main()
