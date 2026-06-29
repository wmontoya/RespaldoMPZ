import os
import sys
import unittest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from utils.entity_validations import (
    validate_meat_waste,
    validate_recycling_on_route,
    validate_recycling_by_campaigns,
    validate_waste,
    validate_buenos_aires_tonnages,
    validate_purchase_orders_ebi,
    validate_private_companies,
    validate_communities_waste_reports,
    validate_route,
)
from tests.utils.test_report_helper import append_test_form


class TestModularWasteManagementRoutes(unittest.TestCase):
    def test_waste_management_and_route_integration(self):
        module = "modular_waste_management_routes"
        test_name = "test_waste_management_and_route_integration"

        route_name = "Ruta 1"
        meat_waste = 10.5
        recycling_on_route = 20
        recycling_by_campaigns = "Campaña Recicla"
        waste_value = 15.0
        buenos_aires = 7.2
        purchase_ebi = "EBI0001"
        private_company = "TrashCorp"
        communities = ["Distrito A", "Distrito B"]

        result_route = validate_route(route_name)
        result_meat_waste = validate_meat_waste(meat_waste)
        result_recycling_route = validate_recycling_on_route(recycling_on_route)
        result_recycling_campaign = validate_recycling_by_campaigns(
            recycling_by_campaigns
        )
        result_waste = validate_waste(waste_value)
        result_buenos_aires = validate_buenos_aires_tonnages(buenos_aires)
        result_purchase_ebi = validate_purchase_orders_ebi(purchase_ebi)
        result_private = validate_private_companies(private_company)
        result_communities = validate_communities_waste_reports(communities)

        self.assertEqual(result_route, route_name)
        self.assertTrue(result_meat_waste)
        self.assertTrue(result_recycling_route)
        self.assertEqual(result_recycling_campaign, recycling_by_campaigns)
        self.assertTrue(result_waste)
        self.assertTrue(result_buenos_aires)
        self.assertEqual(result_purchase_ebi, purchase_ebi)
        self.assertEqual(result_private, private_company)
        self.assertEqual(result_communities, communities)

        append_test_form(
            test_id="modular_waste_management_routes",
            module=module,
            name=test_name,
            status="PASS",
            data={
                "route": result_route,
                "meat_waste": result_meat_waste,
                "recycling_on_route": result_recycling_route,
                "recycling_by_campaigns": result_recycling_campaign,
                "waste": result_waste,
                "buenos_aires_tonnages": result_buenos_aires,
                "purchase_orders_ebi": result_purchase_ebi,
                "private_companies": result_private,
                "communities_waste_reports": result_communities,
            },
            pasos=[
                {
                    "Paso": "Validar integración waste_management + routes",
                    "Entrada": "validación entera de módulo waste_management y ruta",
                    "Resultado esperado": "Todos los validadores retornan valores válidos",
                    "Resultado real": "Todos los validadores retornan valores válidos",
                    "Estado": "PASS",
                }
            ],
        )


if __name__ == "__main__":
    unittest.main()
