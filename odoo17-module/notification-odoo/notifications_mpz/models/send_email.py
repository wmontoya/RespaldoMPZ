from odoo import models
import oci
import os

class IrMailServer(models.Model):
    _inherit = 'mail.mail'

    def send(self, auto_commit=False, raise_exception=False):
        for mail in self:
            recipients = []
            if mail.email_to:
                recipients = [email.strip() for email in mail.email_to.split(",") if email.strip()]
            elif mail.recipient_ids:
                recipients = [p.email for p in mail.recipient_ids if p.email]
            try:
                last_record = self.env["notifications_mpz.oracle_email"].search([], order="id desc", limit=1)
                if not last_record or last_record.state == "inactive":
                    print("No hay configuración activa de notificaciones. Correo no enviado.")
                    continue

                key_file_path = os.path.expanduser("opt/odoo/mpz/extra-addons/notifications_mpz/security/key_private.pem")
                #key_file_path = os.path.expanduser("mnt/extra-addons/notifications_mpz/security/key_private.pem")
                config = {
                    "user": last_record.user_id,
                    "key_file": key_file_path,
                    "fingerprint": last_record.fingerprint,
                    "tenancy": last_record.tenancy,
                    "region": last_record.region,
                }

                email_client = oci.email_data_plane.EmailDPClient(config)

                recipient_objs = [
                    oci.email_data_plane.models.EmailAddress(email=email, name=email)
                    for email in recipients
                ]

                email_details = oci.email_data_plane.models.SubmitEmailDetails(
                    sender=oci.email_data_plane.models.Sender(
                        sender_address=oci.email_data_plane.models.EmailAddress(
                            email="notificaciones@mpz.go.cr", name="Municipalidad de Pérez Zeledón"
                        ),
                        compartment_id=last_record.compartment_id,
                    ),
                    recipients=oci.email_data_plane.models.Recipients(to=recipient_objs),
                    subject=mail.subject or "Notificación",
                    body_html=mail.body_html or mail.body or "Mensaje sin contenido.",
                )

                email_client.submit_email(email_details)
                mail.state = "sent"
                
            except oci.exceptions.ServiceError as e:
                print(f"Error del servicio OCI: {e.message}")
                if raise_exception:
                    raise
            except Exception as e:
                print(f"Error general al enviar correo: {str(e)}")
                if raise_exception:
                    raise

        return True