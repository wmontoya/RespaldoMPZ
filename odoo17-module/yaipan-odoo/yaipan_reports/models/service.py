from odoo import fields, models


class YaipanService(models.Model):
    _name = "yaipan_reports.service"
    _description = "Servicio de Autogestión (tarjeta del SPA)"
    _order = "sequence, id"

    name = fields.Char(
        string="Título",
        required=True,
        translate=True,
        help="Título que se muestra en la tarjeta del SPA.",
    )
    description = fields.Text(
        string="Descripción",
        translate=True,
        help="Texto descriptivo que acompaña al título en la tarjeta.",
    )
    color = fields.Char(
        string="Color de la tarjeta",
        default="#082b63",
        help="Color en formato hexadecimal, por ejemplo: #082b63.",
    )
    icon = fields.Char(
        string="Icono",
        help="Nombre del icono en la librería del SPA (lucide-react), "
        "por ejemplo: Building2, FileText, History, WalletCards.",
    )
    url = fields.Char(
        string="URL del servicio",
        required=True,
        help="Para servicios internos use una ruta relativa "
        "(ej: /dashboard/properties). Para servicios externos use la URL "
        "completa (ej: http://172.19.20.58/reservation).",
    )
    is_external = fields.Boolean(
        string="Enlace externo",
        default=False,
        help="Marque si la URL apunta a un sitio externo. Si no está marcado "
        "se tratará como una ruta interna del SPA.",
    )
    sequence = fields.Integer(
        string="Secuencia",
        default=10,
        help="Determina el orden en que se muestran las tarjetas.",
    )
    active = fields.Boolean(string="Activo", default=True)
