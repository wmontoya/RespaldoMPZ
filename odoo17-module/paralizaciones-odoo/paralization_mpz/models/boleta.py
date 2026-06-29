from odoo import models, fields, api
from odoo import _


def _hora_notificacion_selection():
    horas = []
    for h in range(24):
        for m in (0, 15, 30, 45):
            valor = f"{h:02d}:{m:02d}"
            horas.append((valor, valor))
    return horas


class Boleta(models.Model):
    _name = "paralization_mpz.boleta"
    _description = "Boleta de Paralización de Obra"
    _order = "numero_boleta desc"
    _rec_name = "numero_boleta"

    evidencia_ids = fields.One2many(
        "paralization_mpz.evidencia", "boleta_id", string="Evidencias"
    )

    # HEADER
    numero_boleta = fields.Char("N° Boleta", readonly=True, default="/")
    consecutivo_digital = fields.Char(
        "Consecutivo Digital (I.E...)", help="Número impreso aparte de la boleta"
    )
    fecha_boleta = fields.Date("Fecha", required=True, default=fields.Date.today)

    # datos del inspector
    inspector_id = fields.Many2one("paralization_mpz.inspector", string="Inspector")
    inspector_cedula = fields.Char(
        related="inspector_id.cedula",
        string="Cédula Inspector",
        readonly=True,
        store=True,
    )

    administrador_nombre = fields.Char("Nombre Administrado Infractor")
    administrador_cedula = fields.Char("Cédula Administrado Infractor")

    # INFORMACIÓN DE LA OBRA
    obra_direccion = fields.Text("Dirección del Inmueble")
    obra_distrito_id = fields.Many2one("paralization_mpz.distrito", string="Distrito")
    area_m2 = fields.Float("Área (m²)")
    metros_frente = fields.Float("Metros de Frente")
    cantidad_niveles = fields.Integer("Cantidad de Niveles")
    porcentaje_avance = fields.Float("Porcentaje de Avance (%)", default=0)
    via_acceso = fields.Selection(
        [
            ("servidumbre", "Servidumbre"),
            ("calle_cantonal", "Calle cantonal"),
            ("ruta_nacional", "Ruta Nacional"),
        ],
        string="Vía de Acceso",
    )

    unidad_medida = fields.Selection(
        [
            ("m2", "m²"),
            ("m3", "m³"),
            ("m_lineal", "m lineal"),
        ],
        string="Unidad de Medida",
        default="m2",
    )
    unidad_medida_extra = fields.Char("Otra unidad de medida")

    # TIPOS DE MATERIAL
    tipo_piso_id = fields.Many2one("tipos.piso", "Tipo de Piso", required=True)
    tipo_pared_id = fields.Many2one("tipos.pared", "Tipo de Pared", required=True)
    tipo_techo_id = fields.Many2one("tipos.techo", "Tipo de Techo", required=True)

    # DESCRIPCIÓN DE LA OBRA
    descripcion_obra = fields.Text("Descripción Detallada de la Obra")
    observaciones = fields.Text("Observaciones en Obra")
    afectacion_legal = fields.Text("Obedece a")

    # CONSTANCIA DE NOTIFICACIÓN
    notificado_nombre = fields.Char("Nombre del Notificado")
    notificado_cedula = fields.Char("Cédula del Notificado")
    notificado_hora = fields.Selection(
        _hora_notificacion_selection(), string="Hora de Notificación", default="08:00"
    )
    notificado_firma = fields.Binary("Firma del Notificado")

    # INFORMACIÓN DEL ACTO
    testigo_nombre = fields.Char("Nombre del Testigo")
    testigo_cedula = fields.Char("Cédula del Testigo")
    testigo_firma = fields.Binary("Firma del Testigo")
    acepta_firmar = fields.Boolean("¿Acepta firmar el documento?", default=True)
    inspector_firma = fields.Binary("Firma del Inspector")

    usuario_id = fields.Many2one(
        "res.users", "Usuario", default=lambda self: self.env.user, readonly=True
    )

    inspection_ids = fields.One2many(
        "paralization_mpz.inspection", "boleta_id", string="Actas de Inspección"
    )

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if not vals.get("numero_boleta") or vals.get("numero_boleta") == "/":
                last_boleta = self.search([], order="numero_boleta desc", limit=1)
                if (
                    last_boleta
                    and last_boleta.numero_boleta != "/"
                    and last_boleta.numero_boleta.isdigit()
                ):
                    numero = int(last_boleta.numero_boleta) + 1
                else:
                    numero = 1
                vals["numero_boleta"] = str(numero).zfill(5)
        return super().create(vals_list)

    def action_generar_reporte(self):
        """Generar reporte PDF de la boleta"""
        return {
            "type": "ir.actions.act_url",
            "url": f"/reporte/boleta/{self.id}",
            "target": "new",
        }

    def action_confirm(self):
        """Confirmar la boleta (sin cambio de estado)"""
        pass

    def action_cancel(self):
        """Cancelar la boleta (sin cambio de estado)"""
        pass
