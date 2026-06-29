from odoo import fields, models


class YaipanProcedureTypeEmailLog(models.Model):
    """Bitácora de cambios del correo destino de cada tipo de trámite.

    Se alimenta automáticamente desde ``yaipan_reports.procedure_type.write``
    cada vez que cambia el campo ``notification_email``.
    """

    _name = "yaipan_reports.procedure_type_email_log"
    _description = "Historial de Correos por Tipo de Trámite"
    _order = "change_date desc, id desc"

    type_id = fields.Many2one(
        "yaipan_reports.procedure_type",
        string="Tipo de trámite",
        required=True,
        ondelete="cascade",
        index=True,
    )
    change_date = fields.Datetime(
        string="Fecha",
        default=fields.Datetime.now,
        required=True,
    )
    user_id = fields.Many2one(
        "res.users",
        string="Usuario",
        default=lambda self: self.env.user,
        required=True,
    )
    old_email = fields.Char(string="Correo anterior")
    new_email = fields.Char(string="Correo nuevo")
    note = fields.Char(string="Observación")
