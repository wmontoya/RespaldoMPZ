---
description: Skill para manejo de traducciones en Odoo 17
---

# Skill: Traducciones

## Uso en Código

- Strings UI: `string=_("Texto en español")`.
- Mensajes: `raise UserError(_("Mensaje"))`.

## Archivos .po

- Ubicación: `i18n/es_CR.po`.
- Estructura: msgid (inglés) -> msgstr (español).

## Actualización

- Instala extensión "Odoo Debug".
- En Odoo: Configuraciones > Gestión de idiomas > Actualizar idioma.
- No requiere detener servicio.

## Convenciones

- Capitalización: Primera palabra mayúscula.
- Sin puntos en frases UI.
- Ej: `_("Registrar residuo")`.

## Ejemplo

- Campo: `name = fields.Char(string=_("Nombre"))`.
- En .po: msgid "Name" -> msgstr "Nombre".
