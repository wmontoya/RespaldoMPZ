from reportlab.lib.pagesizes import landscape, letter
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph
from reportlab.lib.styles import getSampleStyleSheet
from odoo import models, fields
import io

class ReportsevriSurveyPDF(models.AbstractModel):
    _name = 'report.sevri_follow_pdf'
    _description = 'Survey Report Service (PDF)'

    report_file = fields.Binary("Archivo de Reporte")
    report_filename = fields.Char("Nombre del Reporte")

    def generate_pdf_report(self, proposed_action_ids):
        proposed_actions = self.env['sev.proposed_action'].browse(proposed_action_ids)

        output = io.BytesIO()
        doc = SimpleDocTemplate(output, pagesize=landscape(letter))

        styles = getSampleStyleSheet()
        title_style = styles['Title']
        heading_style = styles['Heading2']
        paragraph_style = styles['Normal']

        title = Paragraph("Reporte de Acciones Propuestas", title_style)

        headers = [
            "Departamento", "Evento", "Nivel de Riesgo", "Acción Propuesta",
            "Fecha", "Responsable", "Cumplimiento", "Observaciones"
        ]

        data = []
        risk_level_translation = {'low': 'Bajo', 'medium': 'Medio', 'high': 'Alto'}

        event_groups = {}
        for action in proposed_actions:
            event_id = action.event_id.id
            if event_id not in event_groups:
                event_groups[event_id] = {
                    "department": action.event_id.activity_id.department_id.name if action.event_id.activity_id else "",
                    "event_desc": action.event_id.description or "",
                    "risk_level": risk_level_translation.get(action.event_id.risk_level, action.event_id.risk_level),
                    "date": str(action.action_date) if action.action_date else "",
                    "responsible_name": action.responsible_name if action.responsible_name else "",
                    "accomplishment_level": action.accomplishment_level or "No definido",
                    "justification": action.justification or ""
                }
            
            row = [
                event_groups[event_id]["department"],
                event_groups[event_id]["event_desc"],
                event_groups[event_id]["risk_level"],
                self.wrap_text(action.description or ""), 
                event_groups[event_id]["date"],
                event_groups[event_id]["responsible_name"],
                event_groups[event_id]["accomplishment_level"],
                event_groups[event_id]["justification"]
            ]
            data.append(row)

        table = Table([headers] + data, colWidths=[100, 100, 80, 150, 60, 100, 80, 60, 100])
        table.setStyle(TableStyle([  
            ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),  
        ]))

        elements = [title]
        elements.append(table)

        doc.build(elements)

        output.seek(0)

        return output.read(), "application/pdf", "proposed_actions_report.pdf"

    def wrap_text(self, text, max_words=3):
        """Ajusta el texto dividiendo en líneas para que no sobrepase un máximo de palabras por línea."""
        words = text.split()
        lines = []
        for i in range(0, len(words), max_words):
            lines.append(" ".join(words[i:i+max_words]))
        return "\n".join(lines)
