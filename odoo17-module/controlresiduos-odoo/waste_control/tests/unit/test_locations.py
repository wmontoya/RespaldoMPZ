import os
import sys
import unittest

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))
from utils.entity_validations import (
    validate_location_province,
    validate_location_canton,
    validate_location_district,
    validate_location_community,
)
from tests.utils.test_report_helper import append_test_form


class TestLocationValidation(unittest.TestCase):
    def test_valid_locations(self):
        province = "San Jose"
        canton = "Escazu"
        district = "San Rafael"
        community = "Santa Teresa"
        validate_location_province(province)
        validate_location_canton(canton)
        validate_location_district(district)
        validate_location_community(community)
        append_test_form(
            test_id="locations_valid",
            module="locations",
            name="test_valid_locations",
            status="PASS",
            data={
                "province": province,
                "canton": canton,
                "district": district,
                "community": community,
            },
            pasos=[
                {
                    "Paso": "Validar ubicaciones no vacías",
                    "Entrada": f"{province}, {canton}, {district}, {community}",
                    "Resultado esperado": "Todo OK",
                    "Resultado real": "Todo OK",
                    "Estado": "PASS",
                }
            ],
        )


if __name__ == "__main__":
    unittest.main()
