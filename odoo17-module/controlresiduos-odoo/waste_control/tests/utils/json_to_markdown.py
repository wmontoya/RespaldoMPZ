import json
import os
import subprocess
import sys
from collections import Counter


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


FORM_TEMPLATE = """
### Caso de prueba

**Id:** #{id}

**Fecha:** {fecha}

**Modulo:** {modulo}

**Clasificación:** {clasificacion}

---

**Nombre:** {nombre}

---

**Tipo de prueba:** {tipo_de_prueba}

**Estado:** {estado}

---

**Datos de prueba:**

{datos_md}

---

|    # | Paso | Entrada | Resultado esperado | Resultado real | Estado      |
| ---: | ---- | ------- | ------------------ | -------------- | ----------- |
{pasos_md}

---

**Resultado:** {resultado}

---

**Realizada por:** ***{realizada_por_usuario}***

<!-- separador -->
<div style="page-break-after: always;"></div>
"""


MARKDOWN_SPECIAL_CHARS = (
    "\\`*{}()#+!.~"  # no escapamos '-','.', '[', ']' para mantener valores legibles
)


def escape_markdown(text):
    if text is None:
        return ""
    text = str(text)
    # Escapar únicamente los caracteres que rompen tablas y saltos de línea
    text = text.replace("|", "\\|")
    text = text.replace("\n", " ")
    text = text.replace("\r", " ")
    text = text.replace("<", "&lt;")
    text = text.replace(">", "&gt;")
    for ch in MARKDOWN_SPECIAL_CHARS:
        if ch in text:
            text = text.replace(ch, "\\" + ch)
    return text


def detect_special_characters(text):
    if text is None:
        return []
    text = str(text)
    specials = set()
    for ch in text:
        if ord(ch) > 127:
            specials.add(ch)
    return sorted(specials)


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
    ):
        return "Aprobado"
    if estado_clean in ("fail", "failed", "fallido", "error", "reprobado", "cancelado"):
        return "Fallido"
    if estado_clean in ("pendiente", "pending", "en espera"):
        return "Pendiente"
    return "Desconocido"


def to_md_list(items):
    if not items:
        return "* []"
    return "\n".join(f"* {escape_markdown(x)}" for x in items)


def to_md_dict(d):
    if not d:
        return "* []"
    # Usar JSON formateado para mantener objetos y arreglos legibles en el reporte
    json_block = json.dumps(d, ensure_ascii=False, indent=4)
    return f"```json\n{json_block}\n```"


def to_md_steps(steps):
    lines = []
    for i, paso in enumerate(steps, 1):
        lines.append(
            f"| {i:4} | {escape_markdown(paso.get('Paso',''))} | {escape_markdown(paso.get('Entrada',''))} | {escape_markdown(paso.get('Resultado esperado',''))} | {escape_markdown(paso.get('Resultado real',''))} | {escape_markdown(paso.get('Estado',''))} |"
        )
    return "\n".join(lines)


def main():
    if len(sys.argv) < 2:
        print("Uso: python json_to_markdown.py test_report_forms.json [output.md]")
        sys.exit(1)

    input_path = sys.argv[1]
    output_path = sys.argv[2] if len(sys.argv) > 2 else None

    if output_path and os.path.exists(output_path):
        os.remove(output_path)

    with open(input_path, encoding="utf-8") as f:
        forms = json.load(f)

    # For safe Unicode output in Windows console and redirection
    stdout = sys.stdout
    if hasattr(stdout, "reconfigure"):
        try:
            stdout.reconfigure(encoding="utf-8", errors="replace")  # type: ignore
        except Exception:
            pass

    actor = get_git_user_name()

    # Resumen de pruebas por tipo
    counters = Counter()
    for form in forms:
        tipo_clasificacion = normalize_tipo_prueba(
            form.get("Tipo de prueba"), form.get("Modulo"), form.get("Id")
        )
        counters[tipo_clasificacion] += 1

    md = "# Test Gestión de Residuos"
    md += "\n\n## Resumen de tests por tipo\n\n"
    for tipo, cantidad in counters.items():
        md += f"* {tipo}: {cantidad}\n"
    md += "\n---\n\n"

    # Detalle agrupado por tipo de prueba
    forms_by_type = {}
    for form in forms:
        form_tipo = normalize_tipo_prueba(
            form.get("Tipo de prueba"), form.get("Modulo"), form.get("Id")
        )
        forms_by_type.setdefault(form_tipo, []).append(form)

    for tipo in sorted(forms_by_type.keys(), reverse=True):
        md += f"## {tipo}\n"
        for form in forms_by_type[tipo]:
            #
            tipo_clasificacion = normalize_tipo_prueba(
                form.get("Tipo de prueba"), form.get("Modulo"), form.get("Id")
            )
            form["Tipo de prueba"] = tipo_clasificacion
            form["Clasificacion"] = tipo_clasificacion

            form["Estado"] = normalize_estado(form.get("Estado", "Pendiente"))
            form["Resultado"] = normalize_estado(form.get("Resultado", "Pendiente"))

            realizado_por = form.get("Realizada por") or actor

            md += FORM_TEMPLATE.format(
                id=escape_markdown(form.get("Id")),
                fecha=escape_markdown(form.get("Fecha")),
                modulo=escape_markdown(form.get("Modulo")),
                clasificacion=escape_markdown(form.get("Clasificacion")),
                nombre=escape_markdown(form.get("Nombre")),
                tipo_de_prueba=escape_markdown(form.get("Tipo de prueba")),
                estado=escape_markdown(form.get("Estado")),
                datos_md=to_md_dict(form.get("Datos de prueba", {})),
                pasos_md=to_md_steps(form.get("Pasos", [])),
                resultado=escape_markdown(form.get("Resultado")),
                realizada_por_usuario=escape_markdown(realizado_por),
            )

        md += "\n"

    md += "---\n\n"

    if output_path:
        with open(output_path, "w", encoding="utf-8") as out:
            out.write(md)
    else:
        print(md)


if __name__ == "__main__":
    main()
