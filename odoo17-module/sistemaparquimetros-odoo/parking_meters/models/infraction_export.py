from odoo import models, fields, api
from datetime import datetime
import base64
from odoo.exceptions import UserError


class InfractiontExport(models.TransientModel):
    _name = "parking_meters.infraction_export"
    _description = "Export Infractions as SICSOA TXT"

    date_start = fields.Date(string="Start Date", required=True)
    date_end = fields.Date(string="End Date", required=True)
    file_data = fields.Binary("File")
    file_name = fields.Char("File")

    infraction_ids = fields.Many2many(
        comodel_name="parking_meters.infraction",
        string="Infracciones exportadas",
        readonly=True,
    )
    
    infraction_count = fields.Integer(
        string="Total Infractions", compute="_compute_infraction_count"
    )

    @api.depends('infraction_ids')
    def _compute_infraction_count(self):
        for record in self:
            record.infraction_count = len(record.infraction_ids)

    def export_txt(self):
        try:
            if not self.date_start or not self.date_end:
                raise UserError("Debe definir un rango de fechas válido para exportar.")

            domain = [
                ("registration_date", ">=", self.date_start),
                ("registration_date", "<=", self.date_end),
                ("plate_type_id", "!=", 169),  # Excluir PLACA TEMPORAL
                ("plate_type_id", "!=", 137),  # Excluir PLACA TEMPORAL BUSES/TAXIS
                ("infraction_state_id", "=", 1),  # Solo infracciones registradas
            ]
            infractions = self.env["parking_meters.infraction"].search(domain)
            
            if not infractions:
                raise UserError("No se encontraron infracciones dentro del rango de fechas seleccionado.")

            self.write({"infraction_ids": [(6, 0, infractions.ids)]})
            lines = []

            for inf in infractions:
                try:
                    clase_placa = (inf.plate_detail_id.class_code or "").ljust(4)[:4]
                    num_placa = (inf.plate_number or "").ljust(6)[:6]
                    cod_gobierno = (inf.plate_detail_id.government_code or "PAR").ljust(3)[:3]
                    num_boleta = str(inf.ticket_number or "0000000000").rjust(10, "0")[:10]
                    fecha = inf.registration_date.strftime("%d%m%Y") if inf.registration_date else "00000000"
                    provincia = "1"
                    canton = "19"
                    distrito = "01"
                    monto = inf.infraction_price_id.price or 0.0
                    monto_str = f"{monto:014.2f}".replace(".", "")[:14]

                    line = f"{clase_placa}{num_placa}{cod_gobierno}{num_boleta}{fecha}{provincia}{canton}{distrito}{monto_str}"

                    if len(line) != 49:
                        raise ValueError(f"Línea con longitud incorrecta ({len(line)}): {line}")
                    
                    lines.append(line)
                except Exception as e:
                    print(f"Error procesando infracción ID {inf.id}: {e}")
                    continue

            if not lines:
                raise UserError("No se pudo generar ninguna línea válida para el archivo de exportación.")

            content = "\n".join(lines)
            self.file_data = base64.b64encode(content.encode("utf-8"))
            self.file_name = f'infractions_{self.date_start.strftime("%Y%m%d")}_{self.date_end.strftime("%Y%m%d")}.txt'
            
        except UserError:
            raise
        except Exception as e:
            print(f"Error inesperado al exportar infracciones: {e}")
            raise UserError(
                "Ocurrió un error inesperado durante la exportación. Por favor, revise los registros o contacte al administrador."
            )
 
    def download_file(self):
        self.ensure_one()
        
        for inf in self.infraction_ids:
            if inf.infraction_state_id.id == 1:
                inf.infraction_state_id = 5

        return {
            "type": "ir.actions.act_url",
            "url": "/web/content?model=parking_meters.infraction_export&id=%s&field=file_data&filename_field=file_name&download=true"
            % self.id,
            "target": "self",
        }

