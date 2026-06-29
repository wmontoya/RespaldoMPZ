from odoo import models, fields, api
from datetime import datetime
import base64
from odoo.exceptions import UserError
import io


class InfractiontImport(models.TransientModel):
    _name = "parking_meters.infraction_import"
    _description = "Import Infractions as SICSOA TXT"

    
    file_data = fields.Binary("File")
    file_name = fields.Char("File")

    def import_txt(self):
        if not self.file_data:
            raise UserError("Debe adjuntar un archivo TXT para importar.")

        try:
            content = base64.b64decode(self.file_data)
            f = io.StringIO(content.decode("utf-8", errors="ignore"))

            BATCH_SIZE = 300
            tickets_batch = []

            updated = 0
            not_found = []

            for line in f:
                if not line.strip() or len(line) < 23:
                    continue

                tickets_batch.append(line[16:23])

                if len(tickets_batch) >= BATCH_SIZE:
                    u, nf = self._process_batch(tickets_batch)
                    updated += u
                    not_found.extend(nf)
                    tickets_batch.clear()

            # último batch
            if tickets_batch:
                u, nf = self._process_batch(tickets_batch)
                updated += u
                not_found.extend(nf)

            message = f"✅ Se actualizaron {updated} infracciones correctamente."
            if not_found:
                message += (
                    f"\n⚠️ No se encontraron las siguientes boletas:\n"
                    f"{', '.join(not_found)}"
                )

            return {
                "type": "ir.actions.client",
                "tag": "display_notification",
                "params": {
                    "title": "Importación Finalizada",
                    "message": message,
                    "type": "success" if updated else "warning",
                    "sticky": False,
                }
            }

        except Exception as e:
            raise UserError(f"Error al importar el archivo: {str(e)}")

    def _process_batch(self, tickets):
        infractions = self.env["parking_meters.infraction"].search([
            ("ticket_number", "in", tickets)
        ])

        found = set(infractions.mapped("ticket_number"))
        not_found = list(set(tickets) - found)

        infractions.write({"infraction_state_id": 3})

        return len(infractions), not_found