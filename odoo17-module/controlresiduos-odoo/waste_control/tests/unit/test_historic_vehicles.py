import unittest
from utils.entity_validations import validate_historic_vehicle
from tests.utils.test_report_helper import append_test_form


class TestHistoricVehiclesValidation(unittest.TestCase):
    def test_valid_historic_vehicle(self):
        vehicle_id = 1
        meter = 12345
        result = validate_historic_vehicle(vehicle_id, meter)
        self.assertTrue(result)
        append_test_form(
            test_id="historic_vehicles_valid",
            module="historic_vehicles",
            name="test_valid_historic_vehicle",
            status="PASS",
            data={"vehicle_id": vehicle_id, "meter": meter},
            pasos=[
                {
                    "Paso": "Validar histórico de vehículo válido",
                    "Entrada": f"vehicle_id={vehicle_id}, meter={meter}",
                    "Resultado esperado": f"Retorna ({vehicle_id}, {meter})",
                    "Resultado real": f"Retorna {result}",
                    "Estado": "PASS",
                }
            ],
        )

    def test_invalid_historic_vehicle(self):
        vehicle_id = -1
        meter = 12345
        with self.assertRaises(ValueError):
            validate_historic_vehicle(vehicle_id, meter)
        append_test_form(
            test_id="historic_vehicles_invalid",
            module="historic_vehicles",
            name="test_invalid_historic_vehicle",
            status="PASS",
            data={"vehicle_id": vehicle_id, "meter": meter},
            pasos=[
                {
                    "Paso": "Validar histórico de vehículo inválido",
                    "Entrada": f"vehicle_id={vehicle_id}, meter={meter}",
                    "Resultado esperado": "ValueError",
                    "Resultado real": "ValueError",
                    "Estado": "PASS",
                }
            ],
        )


if __name__ == "__main__":
    unittest.main()
