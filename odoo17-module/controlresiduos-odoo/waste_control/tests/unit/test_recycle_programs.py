import unittest
from utils.entity_validations import validate_recycle_program
from tests.utils.test_report_helper import append_test_form


class TestRecycleProgramsValidation(unittest.TestCase):
    def test_valid_recycle_program(self):
        name = "Programa de reciclaje"
        result = validate_recycle_program(name)
        self.assertEqual(result, name)
        append_test_form(
            test_id="recycle_programs_valid_name",
            module="recycle_programs",
            name="test_valid_recycle_program",
            status="PASS",
            data={"name": name},
            pasos=[
                {
                    "Paso": "Validar nombre de programa de reciclaje válido",
                    "Entrada": f"name='{name}'",
                    "Resultado esperado": f"Retorna '{name}'",
                    "Resultado real": f"Retorna '{result}'",
                    "Estado": "PASS",
                }
            ],
        )

    def test_empty_recycle_program(self):
        name = ""
        with self.assertRaises(ValueError):
            validate_recycle_program(name)
        append_test_form(
            test_id="recycle_programs_empty_name",
            module="recycle_programs",
            name="test_empty_recycle_program",
            status="PASS",
            data={"name": name},
            pasos=[
                {
                    "Paso": "Validar nombre vacío",
                    "Entrada": f"name='{name}'",
                    "Resultado esperado": "ValueError",
                    "Resultado real": "ValueError",
                    "Estado": "PASS",
                }
            ],
        )


if __name__ == "__main__":
    unittest.main()
