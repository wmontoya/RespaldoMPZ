import json
import inspect
import os
from datetime import datetime
from pathlib import Path
import subprocess

REPORT_FILE = Path(__file__).resolve().parent.parent / "out/report_forms.json"


def get_git_user_name():
    try:
        name = subprocess.check_output(
            ["git", "config", "user.name"],
            stderr=subprocess.DEVNULL,
            text=True,
            encoding="utf-8",
        ).strip()
        if name:
            return name
    except Exception:
        pass

    return "NombreUsuario"


def normalize_tipo_prueba(tipo_prueba=None, module=None, test_id=None):
    if tipo_prueba:
        tipo_clean = str(tipo_prueba).strip().lower()
        if "modular" in tipo_clean:
            return "Modular"
        return "Unitaria"

    source = "".join(str(x) for x in (module, test_id) if x).lower()
    if "modular" in source:
        return "Modular"
    return "Unitaria"


def normalize_estado(estado):
    if not estado:
        return "Pendiente"
    estado_clean = str(estado).strip().lower()
    if estado_clean in (
        "pass",
        "aprobado",
        "ok",
        "success",
        "finalizado",
        "completado",
        "aprobada",
    ):
        return "Aprobado"
    if estado_clean in (
        "fail",
        "failed",
        "fallido",
        "error",
        "reprobado",
        "cancelado",
        "no aprobado",
    ):
        return "Fallido"
    if estado_clean in ("pendiente", "pending", "en espera", "por hacer"):
        return "Pendiente"
    return "Desconocido"


def _load_report():
    if REPORT_FILE.exists():
        try:
            return json.loads(REPORT_FILE.read_text(encoding="utf-8"))
        except json.JSONDecodeError:
            return []
    return []


def _save_report(data):
    REPORT_FILE.write_text(
        json.dumps(data, indent=4, ensure_ascii=False), encoding="utf-8"
    )


def append_test_form(
    test_id,
    module,
    name,
    status,
    preconditions=None,
    data=None,
    pasos=None,
    resultado="OK",
    realizada_por=None,
    tipo_prueba=None,
):
    preconditions = preconditions or []
    data = data or {}
    pasos = pasos or []

    # Normalización de tipo de prueba: argumento explícito > module/test_id > caller path
    tipo = normalize_tipo_prueba(tipo_prueba, module, test_id)
    if not tipo_prueba:
        try:
            caller_path = inspect.stack()[1].filename or ""
            caller_lower = caller_path.lower()
            if "modular" in caller_lower:
                tipo = "Modular"
            elif "unit" in caller_lower:
                tipo = "Unitaria"
        except Exception:
            pass

    estado = normalize_estado(status)
    resultado = normalize_estado(resultado)
    actor = get_git_user_name()

    report = _load_report()
    form = {
        "Id": test_id,
        "Fecha": datetime.utcnow().strftime("%Y-%m-%d"),
        "Modulo": module,
        "Nombre": name,
        "Tipo de prueba": tipo,
        "Clasificacion": tipo,
        "Estado": estado,
        "Precondiciones": preconditions,
        "Datos de prueba": data,
        "Pasos": pasos,
        "Resultado": resultado,
        "Realizada por": actor,
    }
    report.append(form)
    _save_report(report)


def clear_report():
    _save_report([])
