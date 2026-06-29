---
description: Reglas específicas del proyecto waste_control para consistencia y calidad
---

# Reglas de Consistencia del Proyecto

## Idiomas y Textos
- **Textos para usuario**: Español primario. Todos los strings en UI (etiquetas, mensajes, botones) en español, envueltos en `_()`.
- **Código**: Inglés para variables, funciones, clases, comentarios técnicos y lógica.
- **Traducciones**: Usa `_("Texto en español")` en código; actualiza `.po` vía interfaz Odoo.

## Convenciones de Textos UI
- **Capitalización**: Solo primera palabra mayúscula, salvo lugares (ej. "San José"), acrónimos (ej. "AEPN"), nombres propios.
- **Puntuación**: Sin punto en frases cortas/UI.
- **Espaciado**: Espacios claros para legibilidad.
- **Ejemplos**:
  - ✓ "Registrar nuevo residuo"
  - ✓ "Gestión de residuos en San José"
  - ✗ "Registrar Nuevo Residuo."
  - ✗ "gestión de residuos en san josé."

## Estructura y Nombres
- **Archivos**: `snake_case`, entidades plurales, vistas `entity_view.xml`, reportes `entity_report.py`, wizards `entity_wizard.py`.
- **Campos**: Relaciones `model_ids` (plural), `model_id` (singular).
- **Reportes generados**: `f'Nombre_Reporte_{object.year}'` (inicial mayúscula, "_").

## Desarrollo y Mejores Prácticas
- **Modelos**: `_description` en español; herencia de `mail.thread`.
- **Vistas**: Evita `attrs`; usa permisos. Formatos: form, tree, kanban.
- **Seguridad**: Roles específicos; no eliminación masiva sin auth.
- **Actualizaciones**: Python/XML: Actualiza módulo; traducciones sin detener.
- **Herramientas**: Black para formato, cSpell para corrección (español/inglés).

## Restricciones
- No modificar código base; hereda/extiende.
- No duplicados; no modificar documentos validados.
- Auditoría: Logs y trazabilidad.

## Referencias
- Docs en `docs/develop-odoo-local/`.
- Estructura: `PROJECT-STRUCTURE.txt`.
- Skills específicos: [skill-modelos.md](skill-modelos.md), [skill-vistas.md](skill-vistas.md), [skill-reportes.md](skill-reportes.md), [skill-seguridad.md](skill-seguridad.md), [skill-traducciones.md](skill-traducciones.md).