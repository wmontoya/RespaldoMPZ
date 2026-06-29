from odoo import models, fields, api
import oci
import os
import io
import base64
import mimetypes
from email.message import EmailMessage
from datetime import timedelta


class OracleEmail(models.Model):
    _name = "notifications_mpz.oracle_email"
    _description = "Oracle Email"
    _rec_name = "id"

    user_id = fields.Char(string="User Identification")
    fingerprint = fields.Char(string="Fingerprint")
    tenancy = fields.Char(string="Tenancy")
    region = fields.Char(string="Region Server")
    compartment_id = fields.Char(string="Compartment Identification")
    key_file = fields.Binary(string="Private Key File", attachment=True)
    state = fields.Selection([
        ('active', 'Active'),
        ('inactive', 'Inactive'),
    ], string='State', default='inactive', readonly=False)

    @api.model
    def create(self, vals):
        record = super(OracleEmail, self).create(vals)
        record._save_key_file()
        return record

    def write(self, vals):
        res = super(OracleEmail, self).write(vals)
        self._save_key_file()
        return res

    def _save_key_file(self):
        key_file_path = os.path.expanduser("opt/odoo/mpz/extra-addons/notifications_mpz/security/key_private.pem")
        if self.key_file:
            key_file_content = base64.b64decode(self.key_file)
            with open(key_file_path, 'wb') as f:
                f.write(key_file_content)

    def send_time_notification_email(self, to, subject,plate_number, remaining_time):
        last_record = self.search([], order="id desc", limit=1)
        if not last_record:
            return

        if last_record.state == 'inactive':
            return

        key_file_path = os.path.expanduser("opt/odoo/mpz/extra-addons/notifications_mpz/security/key_private.pem")
        config = {
            "user": last_record.user_id,
            "key_file": key_file_path,
            "fingerprint": last_record.fingerprint,
            "tenancy": last_record.tenancy,
            "region": last_record.region,
        }
        
        template = self.env.ref('notifications_mpz.notification_time_report')
    
        if not template:
            return
        
        context = {
            'plate_number': plate_number,
            'remaining_time':remaining_time
        }

        body_rendered = self.env['ir.qweb']._render(template.id, context)
       
        try:
            email_client = oci.email_data_plane.EmailDPClient(config)
            email_details = oci.email_data_plane.models.SubmitEmailDetails(
                sender=oci.email_data_plane.models.Sender(
                    sender_address=oci.email_data_plane.models.EmailAddress(
                        email="notificaciones@mpz.go.cr", name="Municipalidad de Pérez Zeledón"
                    ),
                    compartment_id=last_record.compartment_id,
                ),
                recipients=oci.email_data_plane.models.Recipients(
                    to=[
                        oci.email_data_plane.models.EmailAddress(
                            email=to, name="Nombre del destinatario"
                        )
                    ],
                    cc=[],
                    bcc=[],
                    
                ),
                subject=subject,
                body_html = body_rendered if body_rendered != "" else "Gracias por utilizar nuestros servicios en línea",
            )
            

            email_client.submit_email(email_details)

        except oci.exceptions.ServiceError as e:
            print(f"Error del servicio OCI: {e.message}", flush=True)
        except Exception as e:
            print(f"Error al enviar el correo: {str(e)}", flush=True)

    def send_payment_notification_email(self, to, subject, payment, name ):
        
        last_record = self.search([], order="id desc", limit=1)
        if not last_record:
            return

        if last_record.state == 'inactive':
            return

        key_file_path = os.path.expanduser("opt/odoo/mpz/extra-addons/notifications_mpz/security/key_private.pem")
        html_file_path = os.path.expanduser("opt/odoo/mpz/extra-addons/notifications_mpz/views/reports/notification_invoice.html")

        config = {
            "user": last_record.user_id,
            "key_file": key_file_path,
            "fingerprint": last_record.fingerprint,
            "tenancy": last_record.tenancy,
            "region": last_record.region,
        }

        body_html = ""
        items_html = ""
        
        if os.path.exists(html_file_path):
            with open(html_file_path, "r", encoding="utf-8") as file:
                body_html = file.read()
                body_html = body_html.replace("{{columna_dos}}", "Placa")
                body_html = body_html.replace("{{factura_numero}}", payment.invoice_temp)
                formatted_date = payment.date_pay.strftime("%d/%m/%Y %I:%M %p")
                body_html = body_html.replace("{{factura_fecha}}", formatted_date)
                body_html = body_html.replace("{{contribuyente_nombre}}", name.upper())
                body_html = body_html.replace("{{contribuyente_cedula}}", payment.identification)
                body_html = body_html.replace("{{factura_intereses}}", "{:,.2f}".format(payment.interest))
                body_html = body_html.replace("{{factura_descuentos}}", "{:,.2f}".format(payment.discount))
                body_html = body_html.replace("{{factura_total}}", "{:,.2f}".format(payment.total_amount))
                for detail in payment.payment_details_ids: 
                    html_item_file_path = os.path.expanduser("opt/odoo/mpz/extra-addons/notifications_mpz/views/reports/item_invoice.html")
                    if os.path.exists(html_item_file_path):
                        with open(html_item_file_path, "r", encoding="utf-8") as file:
                            item_html = file.read()
                            item_html = item_html.replace("{{item_concepto}}", detail.description + (" - " + detail.document_number.split('-')[1] if detail.balance_id == "MIP" else ""))
                            item_html = item_html.replace("{{item_periodo}}", detail.standard_code)
                            item_html = item_html.replace("{{item_monto}}", "{:,.2f}".format(detail.amount))
                            items_html += item_html
                body_html = body_html.replace("{{factura_items}}", items_html)
                
        if not body_html:
            body_html = "Gracias por utilizar nuestros servicios en línea"

        try:
            email_client = oci.email_data_plane.EmailDPClient(config)
            email_details = oci.email_data_plane.models.SubmitEmailDetails(
                sender=oci.email_data_plane.models.Sender(
                    sender_address=oci.email_data_plane.models.EmailAddress(
                        email="notificaciones@mpz.go.cr", name="Municipalidad de Pérez Zeledón"
                    ),
                    compartment_id=last_record.compartment_id,
                ),
                recipients=oci.email_data_plane.models.Recipients(
                    to=[
                        oci.email_data_plane.models.EmailAddress(
                            email=to, name=name
                        )
                    ],
                    cc=[],
                    bcc=[],
                ),
                subject=subject,
                body_html=body_html,
                
            )

            email_client.submit_email(email_details)

        except oci.exceptions.ServiceError as e:
            print(f"Error del servicio OCI: {e.message}")
        except Exception as e:
            print(f"Error al enviar el correo: {str(e)}")

    def send_booking_reminder_email(self, to, subject, name, facility_name,
                                    booking_code, booking_date, booking_time, location):
        last_record = self.search([], order="id desc", limit=1)
        if not last_record:
            return

        if last_record.state == 'inactive':
            return

        key_file_path = os.path.expanduser("opt/odoo/mpz/extra-addons/notifications_mpz/security/key_private.pem")
        html_file_path = os.path.expanduser("opt/odoo/mpz/extra-addons/notifications_mpz/views/reports/notification_reminder.html")

        config = {
            "user": last_record.user_id,
            "key_file": key_file_path,
            "fingerprint": last_record.fingerprint,
            "tenancy": last_record.tenancy,
            "region": last_record.region,
        }

        body_html = ""

        if os.path.exists(html_file_path):
            with open(html_file_path, "r", encoding="utf-8") as file:
                body_html = file.read()
                body_html = body_html.replace("{{cliente_nombre}}", (name or "").strip() or "cliente")
                body_html = body_html.replace("{{instalacion_nombre}}", facility_name or "")
                body_html = body_html.replace("{{reserva_fecha}}", booking_date or "")
                body_html = body_html.replace("{{reserva_hora}}", booking_time or "")
                body_html = body_html.replace("{{instalacion_lugar}}", location or "")
                body_html = body_html.replace("{{reserva_codigo}}", booking_code or "")

        if not body_html:
            body_html = "Te recordamos que tienes una reserva para mañana."

        try:
            email_client = oci.email_data_plane.EmailDPClient(config)
            email_details = oci.email_data_plane.models.SubmitEmailDetails(
                sender=oci.email_data_plane.models.Sender(
                    sender_address=oci.email_data_plane.models.EmailAddress(
                        email="notificaciones@mpz.go.cr", name="Municipalidad de Pérez Zeledón"
                    ),
                    compartment_id=last_record.compartment_id,
                ),
                recipients=oci.email_data_plane.models.Recipients(
                    to=[
                        oci.email_data_plane.models.EmailAddress(
                            email=to, name=name or "cliente"
                        )
                    ],
                    cc=[],
                    bcc=[],
                ),
                subject=subject,
                body_html=body_html,
            )

            email_client.submit_email(email_details)

        except oci.exceptions.ServiceError as e:
            print(f"Error del servicio OCI: {e.message}")
        except Exception as e:
            print(f"Error al enviar el correo: {str(e)}")

    # envio de correo electronico con datos adjuntos
    def send_email_with_attachment(
        self,
        to,
        subject,
        name=None,
        attachment_name=None,
        attachment_content=None,
        body_html=None,
        attachments=None,
    ):
        """Envía un correo (con adjuntos opcionales) usando la API OCI existente.

        Usa ``EmailDPClient.submit_raw_email`` (no ``submit_email``), que acepta
        un mensaje MIME crudo (RFC822) y por tanto SÍ admite adjuntos. Reutiliza
        la misma configuración OCI del modelo (user/fingerprint/tenancy/region/
        compartment + private key); no requiere SMTP ni credenciales nuevas.

        :param to: correo(s) destino; admite varios separados por coma (str)
        :param subject: asunto (str)
        :param name: nombre del destinatario (str, opcional; solo si hay uno)
        :param attachment_name: nombre del adjunto único (str, opcional)
        :param attachment_content: adjunto único en base64 (str, opcional)
        :param body_html: cuerpo HTML del correo (str, opcional)
        :param attachments: lista de adjuntos como tuplas ``(filename, bytes)``
        """
        last_record = self.search([], order="id desc", limit=1)
        if not last_record:
            raise Exception("No hay configuración de Oracle Email registrada.")
        if last_record.state == "inactive":
            raise Exception("La configuración de Oracle Email está inactiva.")

        recipients = [e.strip() for e in (to or "").split(",") if e.strip()]
        if not recipients:
            raise Exception("Debe indicar al menos un destinatario.")

        key_file_path = os.path.join(
            os.path.dirname(os.path.dirname(__file__)),
            "security",
            "key_private.pem",
        )
        config = {
            "user": last_record.user_id,
            "key_file": key_file_path,
            "fingerprint": last_record.fingerprint,
            "tenancy": last_record.tenancy,
            "region": last_record.region,
        }

        sender = "notificaciones@mpz.go.cr"

        # Mensaje MIME (RFC822): cuerpo HTML + adjuntos opcionales.
        msg = EmailMessage()
        msg["Subject"] = subject or "Notificación"
        msg["From"] = "Municipalidad de Pérez Zeledón <%s>" % sender
        if name and len(recipients) == 1:
            msg["To"] = "%s <%s>" % (name, recipients[0])
        else:
            msg["To"] = ", ".join(recipients)
        msg.set_content("Este mensaje requiere un cliente de correo con HTML.")
        msg.add_alternative(
            body_html or "Gracias por utilizar nuestros servicios en línea",
            subtype="html",
        )

        att_list = list(attachments or [])
        if attachment_name and attachment_content:
            att_list.append((attachment_name, base64.b64decode(attachment_content)))
        for fname, data in att_list:
            mime = mimetypes.guess_type(fname)[0] or "application/octet-stream"
            maintype, subtype = mime.split("/", 1)
            msg.add_attachment(
                data, maintype=maintype, subtype=subtype, filename=fname
            )

        raw_message = io.BytesIO(msg.as_bytes())

        try:
            email_client = oci.email_data_plane.EmailDPClient(config)
            email_client.submit_raw_email(
                content_type="message/rfc822",
                compartment_id=last_record.compartment_id,
                sender=sender,
                recipients=recipients,
                raw_message=raw_message,
            )
            return True
        except oci.exceptions.ServiceError as e:
            raise Exception("Error del servicio OCI: %s" % e.message)
