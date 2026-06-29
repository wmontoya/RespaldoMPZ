import unittest
from utils.entity_validations import validate_communities_waste_reports
from tests.utils.test_report_helper import append_test_form


class TestCommunitiesWasteReportsValidation(unittest.TestCase):
    def test_valid_communities_waste_reports(self):
        value = ["Distrito A", "Distrito B"]
        result = validate_communities_waste_reports(value)
        self.assertEqual(result, value)
        append_test_form(
            test_id="communities_waste_reports_valid",
            module="communities_waste_reports",
            name="test_valid_communities_waste_reports",
            status="PASS",
            data={"communities_waste_reports": value},
            pasos=[
                {
                    "Paso": "Validar reporte de residuos por comunidad válido",
                    "Entrada": f"communities_waste_reports={value}",
                    "Resultado esperado": f"Retorna {value}",
                    "Resultado real": f"Retorna {result}",
                    "Estado": "PASS",
                }
            ],
        )

    def test_empty_communities_waste_reports(self):
        value = []
        with self.assertRaises(ValueError):
            validate_communities_waste_reports(value)
        append_test_form(
            test_id="communities_waste_reports_empty",
            module="communities_waste_reports",
            name="test_empty_communities_waste_reports",
            status="PASS",
            data={"communities_waste_reports": value},
            pasos=[
                {
                    "Paso": "Validar reporte de residuos por comunidad vacío",
                    "Entrada": f"communities_waste_reports={value}",
                    "Resultado esperado": "ValueError",
                    "Resultado real": "ValueError",
                    "Estado": "PASS",
                }
            ],
        )


if __name__ == "__main__":
    unittest.main()
