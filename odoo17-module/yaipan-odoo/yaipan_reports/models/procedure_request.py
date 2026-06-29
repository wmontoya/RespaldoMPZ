# MODELO DE SOLICITUDES DE TRÁMITES MUNICIPALES.
# ADMINISTRA EL REGISTRO Y SEGUIMIENTO DE LOS TRÁMITES REALIZADOS POR LOS
# CONTRIBUYENTES, CONTROLANDO SUS ESTADOS, VALIDACIONES, ADJUNTOS Y
# NOTIFICACIONES POR CORREO. INCLUYE LA GENERACIÓN AUTOMÁTICA DEL TRÁMITE
# "ESTADO DE CUENTA", CONSULTA DE SALDOS PENDIENTES, GENERACIÓN DE PDF,
# ENVÍO DE DOCUMENTOS AL SOLICITANTE Y FINALIZACIÓN AUTOMÁTICA DEL PROCESO.
import base64
import logging
import os
import re

from odoo import _, api, fields, models
from odoo.exceptions import UserError, ValidationError

_logger = logging.getLogger(__name__)

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


class YaipanProcedureRequest(models.Model):
    """Solicitud de trámite municipal."""

    _name = "yaipan_reports.procedure_request"
    _description = "Solicitud de Trámite Municipal"
    _inherit = ["mail.thread", "mail.activity.mixin"]
    _order = "create_date desc"

    name = fields.Char(
        string="Número de solicitud",
        required=True,
        copy=False,
        readonly=True,
        index=True,
        default=lambda self: _("Nuevo"),
    )
    cedula = fields.Char(
        string="Número de cédula",
        required=True,
        tracking=True,
    )
    type_id = fields.Many2one(
        comodel_name="yaipan_reports.procedure_type",
        string="Tipo de trámite",
        required=True,
        ondelete="restrict",
        tracking=True,
    )
    email = fields.Char(
        string="Correo electrónico",
        required=True,
        tracking=True,
    )
    phone = fields.Char(
        string="Número de teléfono",
        tracking=True,
    )
    state = fields.Selection(
        selection=[
            ("draft", "Iniciado"),
            ("in_progress", "En proceso"),
            ("done", "Finalizado"),
            ("cancelled", "Anulado"),
        ],
        string="Estado",
        default="draft",
        required=True,
        tracking=True,
    )
    # Campo relacionado: permite mostrar/ocultar y exigir el número de finca
    # en la vista según la configuración del tipo de trámite seleccionado.
    requires_property = fields.Boolean(
        string="Requiere número de finca",
        related="type_id.requires_property",
        readonly=True,
    )
    property_number = fields.Char(
        string="Número de finca",
        tracking=True,
    )
    attachment_ids = fields.Many2many(
        comodel_name="ir.attachment",
        relation="yaipan_procedure_request_attachment_rel",
        column1="request_id",
        column2="attachment_id",
        string="Documentos adjuntos",
    )
    document_sent_date = fields.Datetime(
        string="Documento enviado el",
        readonly=True,
        copy=False,
    )
    document_sent_by = fields.Many2one(
        "res.users",
        string="Documento enviado por",
        readonly=True,
        copy=False,
    )
    done_date = fields.Datetime(
        string="Fecha de finalización",
        readonly=True,
        copy=False,
        tracking=True,
    )
    cancel_reason = fields.Text(
        string="Motivo de anulación",
        readonly=True,
        copy=False,
        tracking=True,
    )
    # Código del tipo (related) para condicionar la vista por tipo de trámite.
    type_code = fields.Char(
        string="Código del tipo",
        related="type_id.code",
        store=True,
        readonly=True,
    )
    # Solo aplica al trámite "Estado de Cuenta": qué tipo de estado se solicitó.
    account_statement_type = fields.Selection(
        selection=[
            ("vencido", "Estado vencidos"),
            ("al_cobro", "Estado al cobro"),
            ("total", "Estado total"),
        ],
        string="Tipo de estado de cuenta",
        readonly=True,
        copy=False,
    )

    # Orden de avance de los estados (cancelled es terminal aparte).
    _STATE_ORDER = {"draft": 0, "in_progress": 1, "done": 2}
    # Mapea el tipo de estado de cuenta del front al filtro de yaipan_get_pending.
    _ACCOUNT_STATEMENT_ESTADO = {
        "vencido": "vencido",
        "al_cobro": "al cobro",
        "total": "todos",
    }

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if not vals.get("name") or vals["name"] == _("Nuevo"):
                vals["name"] = (
                    self.env["ir.sequence"].next_by_code(
                        "yaipan_reports.procedure_request"
                    )
                    or _("Nuevo")
                )
        records = super().create(vals_list)
        # Notificación automática al área responsable (best-effort: un fallo de
        # correo no debe impedir el registro del trámite). El estado de cuenta
        # se autogenera y no notifica al área (skip_area_notification).
        if not self.env.context.get("skip_area_notification"):
            for record in records:
                record._notify_area_new_request()
        return records

    def web_read(self, specification, **kwargs):
        """Cambio heurístico de estado al abrir el trámite.

        Cuando el funcionario abre el formulario (normalmente desde el enlace
        del correo), un trámite en estado "Iniciado" pasa a "En proceso". Solo
        ocurre la primera vez, porque después el estado ya no es 'draft'.
        """
        if len(self) == 1 and self.state == "draft":
            self.sudo().write({"state": "in_progress"})
        return super().web_read(specification, **kwargs)

    def write(self, vals):
        """Controla las transiciones de estado.

        Reglas:
        - Los estados "Finalizado" y "Anulado" son terminales: no se permite
          cambiarlos.
        - No se puede regresar a un estado anterior.
        - "Finalizado" solo se alcanza al enviar el documento al solicitante
          (contexto ``allow_finalize``), nunca de forma manual.
        - Al finalizar se registra automáticamente la fecha de finalización.
        """
        if "state" in vals:
            new_state = vals["state"]
            state_labels = dict(self._fields["state"].selection)
            for record in self:
                old_state = record.state
                if old_state == new_state:
                    continue
                if old_state in ("done", "cancelled"):
                    raise UserError(
                        _(
                            "El trámite %s está '%s' y su estado no puede "
                            "modificarse."
                        )
                        % (record.name, state_labels.get(old_state, old_state))
                    )
                if (
                    new_state in self._STATE_ORDER
                    and old_state in self._STATE_ORDER
                    and self._STATE_ORDER[new_state]
                    < self._STATE_ORDER[old_state]
                ):
                    raise UserError(
                        _("No es posible regresar el trámite a un estado anterior.")
                    )
                if new_state == "done" and not self.env.context.get(
                    "allow_finalize"
                ):
                    raise UserError(
                        _(
                            "El trámite solo puede finalizarse enviando el "
                            "documento adjunto al solicitante."
                        )
                    )
            if new_state == "done" and not vals.get("done_date"):
                vals["done_date"] = fields.Datetime.now()
        return super().write(vals)

    @api.constrains("email")
    def _check_email(self):
        for record in self:
            if record.email and not EMAIL_RE.match(record.email.strip()):
                raise ValidationError(
                    _("El correo electrónico no tiene un formato válido.")
                )

    @api.constrains("type_id", "property_number")
    def _check_property_number(self):
        for record in self:
            if record.type_id.requires_property and not record.property_number:
                raise ValidationError(
                    _(
                        "Debe indicar el número de finca para el trámite '%s'."
                    )
                    % record.type_id.name
                )

    @api.onchange("type_id")
    def _onchange_type_id(self):
        """Limpia el número de finca cuando el tipo de trámite no lo requiere."""
        if not self.requires_property:
            self.property_number = False

    def action_set_in_progress(self):
        self.write({"state": "in_progress"})

    def action_set_cancelled(self):
        """Abre el asistente que solicita el motivo de la anulación."""
        self.ensure_one()
        return {
            "type": "ir.actions.act_window",
            "name": _("Anular trámite"),
            "res_model": "yaipan_reports.procedure_cancel_wizard",
            "view_mode": "form",
            "target": "new",
            "context": {"default_request_id": self.id},
        }

    # ------------------------------------------------------------------
    # Notificaciones por correo
    # ------------------------------------------------------------------
    def _get_backend_url(self):
        """Enlace directo al formulario del trámite dentro de Odoo."""
        self.ensure_one()
        base_url = (
            self.env["ir.config_parameter"].sudo().get_param("web.base.url") or ""
        )
        return "%s/web#id=%s&model=%s&view_type=form" % (
            base_url,
            self.id,
            self._name,
        )

    def _build_area_email_body(self, url):
        """Cuerpo HTML para la notificación al área responsable."""
        self.ensure_one()
        finca = ""
        if self.type_id.requires_property:
            finca = "<p><b>Número de finca:</b> %s</p>" % (
                self.property_number or "-"
            )
        return """
            <div style="font-family:Arial,sans-serif;color:#1f2937;">
                <h2 style="color:#082b63;">Nueva solicitud de trámite</h2>
                <p>Se ha registrado una nueva solicitud de trámite municipal.</p>
                <p><b>N° de trámite:</b> %(name)s</p>
                <p><b>Tipo de trámite:</b> %(tipo)s</p>
                <p><b>Cédula:</b> %(cedula)s</p>
                <p><b>Correo del solicitante:</b> %(email)s</p>
                <p><b>Teléfono:</b> %(phone)s</p>
                %(finca)s
                <p style="margin-top:16px;">
                    <a href="%(url)s"
                       style="background:#082b63;color:#fff;padding:10px 18px;
                              border-radius:6px;text-decoration:none;">
                        Abrir el trámite en Odoo
                    </a>
                </p>
            </div>
        """ % {
            "name": self.name,
            "tipo": self.type_id.name or "",
            "cedula": self.cedula or "",
            "email": self.email or "",
            "phone": self.phone or "-",
            "finca": finca,
            "url": url,
        }

    def _notify_area_new_request(self):
        """Envía el correo automático al área responsable del tipo de trámite."""
        self.ensure_one()
        recipient = self.type_id.notification_email
        if not recipient:
            _logger.info(
                "Trámite %s: el tipo '%s' no tiene correo destino configurado; "
                "no se envía notificación.",
                self.name,
                self.type_id.name,
            )
            return
        try:
            body = self._build_area_email_body(self._get_backend_url())
            subject = "Nueva solicitud de trámite: %s (%s)" % (
                self.name,
                self.type_id.name or "",
            )
            self.env["notifications_mpz.oracle_email"].sudo().send_email_with_attachment(
                to=recipient,
                subject=subject,
                body_html=body,
            )
            self.message_post(
                body=_("Notificación enviada al área responsable: %s") % recipient
            )
        except Exception as e:
            _logger.exception(
                "Error al notificar la nueva solicitud %s: %s", self.name, e
            )

    def _build_citizen_email_body(self):
        """Cuerpo HTML para el correo con el documento al solicitante."""
        self.ensure_one()
        return """
            <div style="font-family:Arial,sans-serif;color:#1f2937;">
                <h2 style="color:#082b63;">Su trámite municipal</h2>
                <p>Estimado(a) contribuyente,</p>
                <p>Adjunto encontrará la documentación correspondiente a su
                   trámite <b>%(name)s</b> (%(tipo)s).</p>
                <p>Gracias por utilizar los servicios en línea de la
                   Municipalidad de Pérez Zeledón.</p>
            </div>
        """ % {
            "name": self.name,
            "tipo": self.type_id.name or "",
        }

    def action_send_document_to_citizen(self):
        """Envía el/los documento(s) adjunto(s) al solicitante y finaliza.

        Valida que exista al menos un adjunto. Ante un error de envío mantiene
        el estado actual y registra el problema en el log.
        """
        self.ensure_one()

        if not self.attachment_ids:
            raise UserError(
                _("Debe adjuntar al menos un documento antes de enviarlo "
                  "al solicitante.")
            )
        if not self.email:
            raise UserError(
                _("El trámite no tiene un correo de solicitante registrado.")
            )

        attachments = [
            (att.name or "documento", att.raw)
            for att in self.attachment_ids
            if att.raw
        ]
        if not attachments:
            raise UserError(_("Los documentos adjuntos están vacíos."))

        try:
            subject = "Su trámite %s - %s" % (self.name, self.type_id.name or "")
            self.env["notifications_mpz.oracle_email"].sudo().send_email_with_attachment(
                to=self.email,
                subject=subject,
                body_html=self._build_citizen_email_body(),
                attachments=attachments,
            )
        except Exception as e:
            _logger.exception(
                "Error al enviar el documento del trámite %s: %s", self.name, e
            )
            raise UserError(
                _("No fue posible enviar el correo al solicitante: %s") % e
            )

        now = fields.Datetime.now()
        # allow_finalize: única vía autorizada para pasar a "Finalizado".
        self.with_context(allow_finalize=True).write(
            {
                "state": "done",
                "document_sent_date": now,
                "document_sent_by": self.env.user.id,
                "done_date": now,
            }
        )
        self.message_post(
            body=_(
                "Documento enviado al solicitante (%s). Trámite finalizado."
            )
            % self.email
        )
        return True

    # ------------------------------------------------------------------
    # Estado de Cuenta (trámite code = "account_statement")
    # ------------------------------------------------------------------
    @api.model
    def create_account_statement_request(self, cedula, email, phone,
                                         statement_type):
        """Genera y envía por correo el estado de cuenta del contribuyente.

        Reutiliza la consulta de saldos pendientes ya existente
        (``yaipan_get_pending`` con filtro por ``estado``) y la API de correo
        OCI (``send_email_with_attachment``). El PDF se arma con wkhtmltopdf.

        Flujo:
          1. Consulta los saldos según el tipo (vencido / al cobro / total).
          2. Si NO hay datos: no crea registro, no genera PDF y no envía correo.
          3. Si hay datos: crea la solicitud (estado "Iniciado"), genera el PDF,
             lo envía adjunto al correo y finaliza el trámite.

        :return: dict con ``success``, ``has_data``, ``number`` y ``message``.
        """
        cedula = (cedula or "").strip()
        email = (email or "").strip()
        phone = (phone or "").strip()
        statement_type = (statement_type or "").strip()

        if statement_type not in self._ACCOUNT_STATEMENT_ESTADO:
            raise UserError(_("Tipo de estado de cuenta inválido."))
        if not cedula:
            raise UserError(_("Debe proporcionar la cédula del contribuyente."))
        if not email or not EMAIL_RE.match(email):
            raise UserError(_("Debe proporcionar un correo electrónico válido."))

        # 1. Saldos pendientes filtrados por el tipo solicitado.
        estado = self._ACCOUNT_STATEMENT_ESTADO[statement_type]
        conn = self.env["yaipan_reports.yaipan_api_connection"].sudo()
        pend = conn.yaipan_get_pending(cedula=cedula, estado=estado)
        if not pend.get("success"):
            raise UserError(
                pend.get("error") or _("No fue posible consultar los saldos.")
            )
        saldos = pend.get("result") or []

        # 2. Sin datos: no PDF, no registro, no correo.
        if not saldos:
            return {
                "success": True,
                "has_data": False,
                "message": _(
                    "No se encontraron saldos pendientes para el tipo de "
                    "estado de cuenta seleccionado."
                ),
            }

        ptype = (
            self.env["yaipan_reports.procedure_type"]
            .sudo()
            .search([("code", "=", "account_statement")], limit=1)
        )
        if not ptype:
            raise UserError(
                _("No existe el tipo de trámite 'Estado de Cuenta'.")
            )

        # 3. Crear la solicitud en estado "Iniciado" (sin notificar al área).
        record = self.sudo().with_context(skip_area_notification=True).create(
            {
                "cedula": cedula,
                "email": email,
                "phone": phone,
                "type_id": ptype.id,
                "state": "draft",
                "account_statement_type": statement_type,
            }
        )

        nombre = record._get_person_name(cedula)
        type_label = dict(
            self._fields["account_statement_type"].selection
        ).get(statement_type, statement_type)

        # Generación de PDF + envío. Si falla, el registro queda "Iniciado".
        try:
            pdf_bytes = record._render_account_statement_pdf(
                nombre, saldos, type_label
            )
            filename = "estado_de_cuenta_%s.pdf" % (record.name or cedula)
            self.env["notifications_mpz.oracle_email"].sudo().send_email_with_attachment(
                to=email,
                subject=_("Estado de cuenta municipal - %s") % record.name,
                name=nombre or None,
                body_html=record._build_account_statement_email_body(
                    nombre, type_label
                ),
                attachments=[(filename, pdf_bytes)],
            )
        except Exception as e:
            _logger.exception(
                "Error al generar/enviar el estado de cuenta %s: %s",
                record.name,
                e,
            )
            record.message_post(
                body=_("Error al generar o enviar el estado de cuenta: %s") % e
            )
            return {
                "success": False,
                "has_data": True,
                "number": record.name,
                "message": _(
                    "Su solicitud fue registrada, pero ocurrió un error al "
                    "generar o enviar el estado de cuenta. Intente nuevamente "
                    "más tarde."
                ),
            }

        # 4. Finalizar el trámite (única vía: documento enviado).
        now = fields.Datetime.now()
        record.with_context(allow_finalize=True).write(
            {
                "state": "done",
                "done_date": now,
                "document_sent_date": now,
                "document_sent_by": self.env.user.id,
            }
        )
        record.message_post(
            body=_("Estado de cuenta (%s) generado y enviado a %s.")
            % (type_label, email)
        )
        return {
            "success": True,
            "has_data": True,
            "number": record.name,
            "message": _(
                "Su solicitud ha sido atendida correctamente. El estado de "
                "cuenta fue enviado al correo electrónico indicado."
            ),
        }

    def _get_person_name(self, cedula):
        """Nombre del contribuyente vía la consulta SQL de personas."""
        try:
            rows = (
                self.env["yaipan_reports.oracle"]
                .sudo()
                .ejecutar_query_oracle(
                    "website/information/people_information.sql",
                    parametros={"cedula": cedula},
                )
            )
            if rows:
                return (rows[0].get("nombre_completo") or "").strip()
        except Exception as e:
            _logger.warning(
                "No se pudo obtener el nombre del contribuyente %s: %s",
                cedula,
                e,
            )
        return ""

    def _render_account_statement_pdf(self, nombre, saldos, type_label):
        """Convierte el HTML del estado de cuenta a PDF con wkhtmltopdf."""
        self.ensure_one()
        html = self._build_account_statement_html(nombre, saldos, type_label)
        report = self.env["ir.actions.report"].sudo()
        pdf_content = report._run_wkhtmltopdf([html])
        return pdf_content

    @staticmethod
    def _fmt_money(value):
        try:
            return "{:,.2f}".format(float(value or 0))
        except (TypeError, ValueError):
            return "0.00"

    def _get_escudo_data_uri(self):
        """Devuelve el escudo institucional como data URI PNG base64 (o "").

        El archivo ``static/img/escudo.png`` es un PNG real (ya normalizado y
        redimensionado) que el motor de wkhtmltopdf renderiza sin problema. Se
        incrusta en el PDF para no depender de rutas/red externas.
        """
        try:
            real_file = os.path.realpath(__file__)
            path = os.path.join(
                os.path.dirname(os.path.dirname(real_file)),
                "static",
                "img",
                "escudo.png",
            )
            with open(path, "rb") as f:
                encoded = base64.b64encode(f.read()).decode("ascii")
            return "data:image/png;base64,%s" % encoded
        except Exception as e:
            _logger.warning("No se pudo cargar el escudo para el PDF: %s", e)
            return ""

    def _build_account_statement_html(self, nombre, saldos, type_label):
        """Arma el HTML del estado de cuenta agrupado por concepto."""
        self.ensure_one()

        # Agrupar por concepto (descripción), preservando el orden de aparición.
        grupos = {}
        for item in saldos:
            concepto = (item.get("descripcion") or "Sin concepto").strip()
            grupos.setdefault(concepto, []).append(item)

        filas_html = ""
        gran_monto = gran_interes = gran_multa = gran_total = 0.0

        for concepto, items in grupos.items():
            filas_html += (
                "<tr class='grupo'><td colspan='6'>%s</td></tr>" % concepto
            )
            sub_monto = sub_interes = sub_multa = sub_total = 0.0
            for it in items:
                monto = float(it.get("monto") or 0)
                interes = float(it.get("saldoInteres") or 0)
                multa = float(it.get("montoMulta") or 0)
                total = monto + interes + multa
                sub_monto += monto
                sub_interes += interes
                sub_multa += multa
                sub_total += total
                periodo = "%s-%s" % (
                    it.get("year") or "",
                    it.get("periodo") or "",
                )
                filas_html += (
                    "<tr>"
                    "<td>%s</td>"
                    "<td>%s</td>"
                    "<td class='num'>%s</td>"
                    "<td class='num'>%s</td>"
                    "<td class='num'>%s</td>"
                    "<td class='num'>%s</td>"
                    "</tr>"
                ) % (
                    periodo,
                    it.get("numeroFinca") or "-",
                    self._fmt_money(monto),
                    self._fmt_money(interes),
                    self._fmt_money(multa),
                    self._fmt_money(total),
                )

            filas_html += (
                "<tr class='subtotal'>"
                "<td colspan='2'>Subtotal %s</td>"
                "<td class='num'>%s</td>"
                "<td class='num'>%s</td>"
                "<td class='num'>%s</td>"
                "<td class='num'>%s</td>"
                "</tr>"
            ) % (
                concepto,
                self._fmt_money(sub_monto),
                self._fmt_money(sub_interes),
                self._fmt_money(sub_multa),
                self._fmt_money(sub_total),
            )

            gran_monto += sub_monto
            gran_interes += sub_interes
            gran_multa += sub_multa
            gran_total += sub_total

        fecha_emision = fields.Date.context_today(self).strftime("%d/%m/%Y")

        escudo_uri = self._get_escudo_data_uri()
        escudo_img = (
            '<img src="%s" alt="Escudo"/>' % escudo_uri if escudo_uri else ""
        )

        return """
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<style>
  * { box-sizing: border-box; }
  body { font-family: Arial, Helvetica, sans-serif; color: #1f2937;
         font-size: 12px; margin: 24px; }
  .header { text-align: center; border-bottom: 3px solid #082b63;
            padding-bottom: 10px; margin-bottom: 16px; }
  .header img { height: 74px; margin-bottom: 6px; }
  .header h1 { color: #082b63; font-size: 18px; margin: 0; }
  .header p { margin: 2px 0; font-size: 11px; color: #374151; }
  .meta { width: 100%%; margin-bottom: 14px; border-collapse: collapse; }
  .meta td { padding: 3px 6px; font-size: 11px; vertical-align: top; }
  .meta .label { color: #6b7280; width: 130px; }
  .meta .value { font-weight: bold; color: #111827; }
  .badge { display: inline-block; background: #082b63; color: #fff;
           padding: 3px 10px; border-radius: 4px; font-size: 11px; }
  table.detalle { width: 100%%; border-collapse: collapse; margin-top: 6px; }
  table.detalle th { background: #082b63; color: #fff; font-size: 11px;
                     padding: 7px 6px; text-align: left; }
  table.detalle th.num, table.detalle td.num { text-align: right; }
  table.detalle td { padding: 6px; border-bottom: 1px solid #e5e7eb;
                     font-size: 11px; }
  tr.grupo td { background: #eef2f7; font-weight: bold; color: #082b63;
                border-top: 2px solid #cbd5e1; }
  tr.subtotal td { background: #f8fafc; font-weight: bold; }
  tr.total td { background: #082b63; color: #fff; font-weight: bold;
                font-size: 12px; }
  .footer { margin-top: 22px; border-top: 1px solid #d1d5db; padding-top: 10px;
            font-size: 10px; color: #6b7280; }
</style>
</head>
<body>
  <div class="header">
    %(escudo)s
    <h1>MUNICIPALIDAD DE PÉREZ ZELEDÓN</h1>
    <p>Departamento de Administración Tributaria — Sección de Cobros</p>
    <p><strong>Estado de Cuenta</strong></p>
  </div>

  <table class="meta">
    <tr>
      <td class="label">Señor(a)(ita):</td>
      <td class="value">%(nombre)s</td>
      <td class="label">Cédula:</td>
      <td class="value">%(cedula)s</td>
    </tr>
    <tr>
      <td class="label">Correo electrónico:</td>
      <td class="value">%(email)s</td>
      <td class="label">Teléfono móvil:</td>
      <td class="value">%(phone)s</td>
    </tr>
    <tr>
      <td class="label">Fecha de emisión:</td>
      <td class="value">%(fecha)s</td>
      <td class="label">Tipo de estado:</td>
      <td class="value"><span class="badge">%(tipo)s</span></td>
    </tr>
    <tr>
      <td class="label">N° de trámite:</td>
      <td class="value">%(numero)s</td>
      <td></td><td></td>
    </tr>
  </table>

  <table class="detalle">
    <thead>
      <tr>
        <th>Periodo</th>
        <th>Finca</th>
        <th class="num">Monto</th>
        <th class="num">Interés</th>
        <th class="num">Multa</th>
        <th class="num">Total</th>
      </tr>
    </thead>
    <tbody>
      %(filas)s
      <tr class="total">
        <td colspan="2">TOTAL GENERAL</td>
        <td class="num">%(g_monto)s</td>
        <td class="num">%(g_interes)s</td>
        <td class="num">%(g_multa)s</td>
        <td class="num">%(g_total)s</td>
      </tr>
    </tbody>
  </table>

  <div class="footer">
    <p>Documento generado automáticamente por la plataforma de autogestión de
       la Municipalidad de Pérez Zeledón. El monto total del estado de cuenta
       puede variar después de la fecha de emisión.</p>
    <p>Considérese como documento de notificación según el art. 137 del Código
       de Normas y Procedimientos Tributarios, Ley 4755.</p>
  </div>
</body>
</html>
        """ % {
            "escudo": escudo_img,
            "nombre": nombre or "-",
            "cedula": self.cedula or "",
            "email": self.email or "",
            "phone": self.phone or "-",
            "fecha": fecha_emision,
            "tipo": type_label,
            "numero": self.name or "",
            "filas": filas_html,
            "g_monto": self._fmt_money(gran_monto),
            "g_interes": self._fmt_money(gran_interes),
            "g_multa": self._fmt_money(gran_multa),
            "g_total": self._fmt_money(gran_total),
        }

    def _build_account_statement_email_body(self, nombre, type_label):
        """Cuerpo HTML del correo que acompaña el PDF del estado de cuenta."""
        self.ensure_one()
        return """
            <div style="font-family:Arial,sans-serif;color:#1f2937;">
                <h2 style="color:#082b63;">Estado de cuenta municipal</h2>
                <p>Estimado(a) %(nombre)s,</p>
                <p>Adjunto encontrará el <b>estado de cuenta (%(tipo)s)</b>
                   solicitado a través de la plataforma de autogestión de la
                   Municipalidad de Pérez Zeledón.</p>
                <p>Si no realizó esta solicitud, haga caso omiso de este correo.</p>
                <p>Gracias por utilizar nuestros servicios en línea.</p>
            </div>
        """ % {
            "nombre": nombre or "contribuyente",
            "tipo": type_label,
        }
