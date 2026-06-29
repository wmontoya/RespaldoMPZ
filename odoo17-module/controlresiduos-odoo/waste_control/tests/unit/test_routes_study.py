import os
import sys
import unittest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
from utils.routes_study_validation import validate_routes_study_range
from tests.utils.test_report_helper import append_test_form


class TestRoutesStudyValidation(unittest.TestCase):
    def test_valid_route(self):
        number = 1
        km = 10.5
        validate_routes_study_range(number, km)
        append_test_form(
            test_id="routes_study_valid",
            module="routes_study",
            name="test_valid_route",
            status="PASS",
            data={"number": number, "kilometers_of_route": km},
            pasos=[
                {
                    "Paso": "Validar ruta válida",
                    "Entrada": f"number={number}, kilometers_of_route={km}",
                    "Resultado esperado": "No excepción",
                    "Resultado real": "No excepción",
                    "Estado": "PASS",
                }
            ],
        )

    def test_negative_number(self):
        number = -1
        km = 10.5
        with self.assertRaises(ValueError):
            validate_routes_study_range(number, km)
        append_test_form(
            test_id="routes_study_negative_number",
            module="routes_study",
            name="test_negative_number",
            status="PASS",
            data={"number": number, "kilometers_of_route": km},
            pasos=[
                {
                    "Paso": "Validar número negativo",
                    "Entrada": f"number={number}, kilometers_of_route={km}",
                    "Resultado esperado": "ValueError",
                    "Resultado real": "ValueError",
                    "Estado": "PASS",
                }
            ],
        )

    def test_negative_kilometers(self):
        number = 1
        km = -5.0
        with self.assertRaises(ValueError):
            validate_routes_study_range(number, km)
        append_test_form(
            test_id="routes_study_negative_kilometers",
            module="routes_study",
            name="test_negative_kilometers",
            status="PASS",
            data={"number": number, "kilometers_of_route": km},
            pasos=[
                {
                    "Paso": "Validar kilómetros negativos",
                    "Entrada": f"number={number}, kilometers_of_route={km}",
                    "Resultado esperado": "ValueError",
                    "Resultado real": "ValueError",
                    "Estado": "PASS",
                }
            ],
        )


if __name__ == "__main__":
    unittest.main()
