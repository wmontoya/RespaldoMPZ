
#Modulo de tipos de tramites
import re

from odoo import _, api, fields, models
from odoo.exceptions import ValidationError

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


class YaipanProcedureType(models.Model):
    """Tipo de trámite municipal.

    Modelo de configuración que permite agregar nuevos tipos de trámite sin
    modificar el código. El indicador ``requires_property`` controla, de forma
    declarativa, si las solicitudes de ese tipo deben exigir el número de finca.
    """

    _name = "yaipan_reports.procedure_type"
    _description = "Tipo de Trámite Municipal"
    _order = "sequence, name"

    name = fields.Char(
        string="Nombre",
        required=True,
        translate=True,
        help="Nombre del tipo de trámite tal como lo verá el usuario.",
    )
    code = fields.Char(
        string="Código",
        help="Código técnico para identificar el tipo de trámite desde el "
        "código o integraciones externas.",
    )
    description = fields.Text(string="Descripción", translate=True)
    notification_email = fields.Char(
        string="Correo(s) destino",
        help="Correo del área responsable a la que se notifica cuando se "
        "registra un trámite de este tipo. Puede indicar varios separados "
        "por coma. Configurable; nunca se quema en código.",
    )
    change_note = fields.Char(
        string="Observación del cambio",
        help="Observación opcional que se guardará en el historial cuando "
        "cambie el correo destino.",
    )
    email_log_ids = fields.One2many(
        "yaipan_reports.procedure_type_email_log",
        "type_id",
        string="Historial de correos",
        readonly=True,
    )
    icon = fields.Char(
        string="Icono",
        default="FileText",
        help="Nombre del icono en la librería del SPA (lucide-react), por "
        "ejemplo: FileText, Landmark, ReceiptText.",
    )
    color = fields.Char(
        string="Color de la tarjeta",
        default="#082b63",
        help="Color en formato hexadecimal, por ejemplo: #082b63.",
    )
    requires_property = fields.Boolean(
        string="Requiere número de finca",
        default=False,
        help="Si está activo, las solicitudes de este tipo exigirán el "
        "número de finca.",
    )
    sequence = fields.Integer(
        string="Secuencia",
        default=10,
        help="Determina el orden en que se muestran los tipos de trámite.",
    )
    active = fields.Boolean(string="Activo", default=True)

    _sql_constraints = [
        (
            "code_uniq",
            "unique(code)",
            "El código del tipo de trámite debe ser único.",
        ),
    ]

    @api.constrains("notification_email")
    def _check_notification_email(self):
        """Valida cada correo destino (admite varios separados por coma)."""
        for record in self:
            if not record.notification_email:
                continue
            emails = [
                e.strip()
                for e in record.notification_email.split(",")
                if e.strip()
            ]
            invalid = [e for e in emails if not EMAIL_RE.match(e)]
            if invalid:
                raise ValidationError(
                    _(
                        "Los siguientes correos destino no tienen un formato "
                        "válido: %s"
                    )
                    % ", ".join(invalid)
                )

    def write(self, vals):
        """Registra en la bitácora cualquier cambio del correo destino."""
        logs = []
        if "notification_email" in vals:
            for record in self:
                old_email = record.notification_email or ""
                new_email = vals.get("notification_email") or ""
                if old_email != new_email:
                    logs.append(
                        {
                            "type_id": record.id,
                            "old_email": old_email,
                            "new_email": new_email,
                            "note": vals.get("change_note")
                            or record.change_note
                            or "",
                        }
                    )
        res = super().write(vals)
        if logs:
            self.env["yaipan_reports.procedure_type_email_log"].create(logs)
        return res
