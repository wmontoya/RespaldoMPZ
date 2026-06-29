from tests.utils.test_report_helper import normalize_estado, normalize_tipo_prueba


def test_normalize_tipo_prueba_modular():
    assert normalize_tipo_prueba(tipo_prueba="modular") == "Modular"
    assert normalize_tipo_prueba(module="modular_flow") == "Modular"
    assert normalize_tipo_prueba(test_id="modular_001") == "Modular"


def test_normalize_tipo_prueba_unit():
    assert normalize_tipo_prueba(tipo_prueba="unit") == "Unitaria"


def test_normalize_estado():
    assert normalize_estado("PASS") == "Aprobado"
    assert normalize_estado("fail") == "Fallido"
    assert normalize_estado("unknown") == "Desconocido"
