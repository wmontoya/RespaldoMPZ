import unittest
from utils.entity_validations import validate_recycling_by_campaigns
from tests.utils.test_report_helper import append_test_form


class TestRecyclingByCampaignsValidation(unittest.TestCase):
    def test_valid_recycling_by_campaigns(self):
        name = "Campaña Recicla"
        result = validate_recycling_by_campaigns(name)
        self.assertEqual(result, name)
        append_test_form(
            test_id="recycling_by_campaigns_valid",
            module="recycling_by_campaigns",
            name="test_valid_recycling_by_campaigns",
            status="PASS",
            data={"recycling_by_campaigns": name},
            pasos=[
                {
                    "Paso": "Validar reciclaje por campañas válido",
                    "Entrada": f"recycling_by_campaigns={name}",
                    "Resultado esperado": f"Retorna {name}",
                    "Resultado real": f"Retorna {result}",
                    "Estado": "PASS",
                }
            ],
        )

    def test_empty_recycling_by_campaigns(self):
        name = ""
        with self.assertRaises(ValueError):
            validate_recycling_by_campaigns(name)
        append_test_form(
            test_id="recycling_by_campaigns_empty",
            module="recycling_by_campaigns",
            name="test_empty_recycling_by_campaigns",
            status="PASS",
            data={"recycling_by_campaigns": name},
            pasos=[
                {
                    "Paso": "Validar reciclaje por campañas vacío",
                    "Entrada": f"recycling_by_campaigns={name}",
                    "Resultado esperado": "ValueError",
                    "Resultado real": "ValueError",
                    "Estado": "PASS",
                }
            ],
        )


if __name__ == "__main__":
    unittest.main()
