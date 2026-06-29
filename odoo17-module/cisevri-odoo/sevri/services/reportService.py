import io
import xlsxwriter
from odoo import models, fields
import logging

_logger = logging.getLogger(__name__)

class ReportsevriSurvey(models.AbstractModel):
    _name = 'report.sevri_follow'
    _description = 'Survey Report Service'

    report_file = fields.Binary("Archivo de Reporte")
    report_filename = fields.Char("Nombre del Reporte")

    def generate_excel_report(self, proposed_action_ids):
        _logger.info(f"Generating Excel report for proposed actions: {proposed_action_ids}")
        proposed_actions = self.env['sev.proposed_action'].browse(proposed_action_ids)

        output = io.BytesIO()
        workbook = xlsxwriter.Workbook(output, {'in_memory': True})

        wrap_format = workbook.add_format({'text_wrap': True}) 
        border_format = workbook.add_format({'text_wrap': True, 'border': 1}) 
        level_translation = {"yes": "Sí", "no": "No", "partial":"Parcial"}

        header_format = workbook.add_format({
            'bold': True, 'bg_color': '#DDEBF7', 'border': 1, 'align': 'center', 'text_wrap': True
        })

        worksheet = workbook.add_worksheet("Todas las Acciones Propuestas")
        headers = ["ID", "Evento", "Descripción", "Responsable", "Nivel de Cumplimiento"]

        for col, header in enumerate(headers):
            worksheet.write(0, col, header, header_format)

        row = 1
        for action in proposed_actions:
            _logger.info(f"Writing proposed action: {action.event_id.display_name}")
            _logger.info(f"Action: {action.event_id.display_name} - {action.description} - {action.responsible_name} - {action.accomplishment_level}")
            worksheet.write(row, 0, action.id or "", border_format if action.id else wrap_format)
            worksheet.write(row, 1, str(action.event_id.display_name) if action.event_id else "Sin evento", border_format if action.event_id else wrap_format)
            worksheet.write(row, 2, action.description or "Sin descripción", border_format if action.description else wrap_format)
            worksheet.write(row, 3, action.responsible_name if action.responsible_name else "No asignado", border_format if action.responsible_name else wrap_format)
            worksheet.write(row, 4, level_translation.get(action.accomplishment_level, action.accomplishment_level) or "No definido", border_format if action.accomplishment_level else wrap_format)

            worksheet.set_row(row, None, wrap_format) 
            row += 1

        worksheet.set_column('A:E', 20)
        worksheet.autofilter(0, 0, row - 1, len(headers) - 1)

        row_start = self.generate_compliance_chart(workbook, worksheet, 7)
        worksheet.set_column('L:M', 22)
        
        sheet_analysis = workbook.add_worksheet("Análisis de Seguimiento")
        header_format_analysis = workbook.add_format({'bold': True, 'bg_color': '#FFE599', 'border': 1, 'text_wrap': True})

        headers_analysis = [
            "Departamento", "Evento", "Nivel de Riesgo", "Acción Propuesta",
            "Fecha", "Indicadores", "Responsable", "Cumplimiento", "Observaciones"
        ]

        for col, header in enumerate(headers_analysis):
            sheet_analysis.write(0, col, header, header_format_analysis)

        risk_level_translation = {'low': 'Bajo', 'medium': 'Medio', 'high': 'Alto'}

        row = 1
        for action in proposed_actions:
            _logger.info(f"Writing proposed action: {action.event_id.activity_id.department_id.name} - {action.event_id.description} - {action.event_id.risk_level} - {action.description} - {str(action.action_date)} - {action.indicators} - {action.responsible_name} - {action.accomplishment_level} - {action.justification}")
            sheet_analysis.write(row, 0, action.event_id.activity_id.department_id.name if action.event_id.activity_id else "", border_format if action.event_id.activity_id else wrap_format)
            sheet_analysis.write(row, 1, action.event_id.description or "", border_format if action.event_id.description else wrap_format)
            sheet_analysis.write(row, 2, risk_level_translation.get(action.event_id.risk_level, action.event_id.risk_level), border_format if action.event_id.risk_level else wrap_format)
            sheet_analysis.write(row, 3, action.description or "", border_format if action.description else wrap_format)
            sheet_analysis.write(row, 4, str(action.action_date) if action.action_date else "", border_format if action.action_date else wrap_format)
            sheet_analysis.write(row, 5, action.indicators or "", border_format if action.indicators else wrap_format)
            sheet_analysis.write(row, 6, action.responsible_name if action.responsible_name else "", border_format if action.responsible_name else wrap_format)
            sheet_analysis.write(row, 7, level_translation.get(action.accomplishment_level, action.accomplishment_level) or "No definido", border_format if action.accomplishment_level else wrap_format)
            sheet_analysis.write(row, 8, action.justification or "", border_format if action.justification else wrap_format)
            
            sheet_analysis.set_row(row, None, wrap_format)
            row += 1
        sheet_analysis.set_column('A:I', 20)
        sheet_analysis.autofilter(0, 0, row - 1, len(headers_analysis) - 1)
        row_start = self.generate_level_risk_chart(workbook, sheet_analysis, 9)
        sheet_analysis.set_column('P:Q', 24)
        
        sheet_internal_external = workbook.add_worksheet("Eventos Internas y Externas")
        header_format_internal = workbook.add_format({'bold': True, 'bg_color': '#F4CCCC', 'border': 1, 'text_wrap': True})

        headers_internal_external = [
            "Descripción", "Indicadores", "Justificación", "Responsable", 
            "Nivel de Cumplimiento", "Fecha de Acción", "Tipo de Acción"
        ]

        for col, header in enumerate(headers_internal_external):
            sheet_internal_external.write(0, col, header, header_format_internal)

        row = 1
        for action in proposed_actions:
            action_type = action.event_id.event_type_id.name if action.event_id.event_type_id else 'Desconocido'
            sheet_internal_external.write(row, 0, action.description or "", border_format if action.description else wrap_format)
            sheet_internal_external.write(row, 1, action.indicators or "", border_format if action.indicators else wrap_format)
            sheet_internal_external.write(row, 2, action.justification or "", border_format if action.justification else wrap_format)
            sheet_internal_external.write(row, 3, action.responsible_name if action.responsible_name else "", border_format if action.responsible_name else wrap_format)
            sheet_internal_external.write(row, 4, action.accomplishment_level or "No definido", border_format if action.accomplishment_level else wrap_format)
            sheet_internal_external.write(row, 4, level_translation.get(action.accomplishment_level, action.accomplishment_level) or "No definido", border_format if action.accomplishment_level else wrap_format)
            sheet_internal_external.write(row, 5, str(action.action_date) if action.action_date else "", border_format if action.action_date else wrap_format)
            sheet_internal_external.write(row, 6, action_type, border_format if action_type else wrap_format)

            sheet_internal_external.set_row(row, None, wrap_format)
            row += 1
        sheet_internal_external.set_column('A:G', 20)
        sheet_internal_external.autofilter(0, 0, row - 1, len(headers_internal_external) - 1)
        row_start = self.generate_internal_external_risk_chart(workbook, sheet_internal_external, 9)
        sheet_internal_external.set_column('N:O', 32)
        
        worksheet = workbook.add_worksheet("Resumen Completo")
        headers = [
            "ID", "Evento", "Descripción", "Responsable", "Nivel de Cumplimiento", "Indicadores",
            "Justificación", "Fecha de Acción", "Tipo de Evento", "Clasificación", "Especificación",
            "Probabilidad", "Impacto", "Nivel de Riesgo", "Medidas de Control Existentes",
            "Actitud", "Aptitud", "Nuevo Nivel de Riesgo", "Aceptación", "Fecha de Creación",
            "Última Actualización", "Estado"
        ]

        for col, header in enumerate(headers):
            worksheet.write(0, col, header, header_format)

        row = 1
        for action in proposed_actions:
            event = action.event_id
            worksheet.write(row, 0, action.id or "", border_format)
            worksheet.write(row, 1, event.description if event else "Sin evento", border_format)
            worksheet.write(row, 2, action.description or "Sin descripción", border_format)
            worksheet.write(row, 3, action.responsible_name if action.responsible_name else "No asignado", border_format)
            worksheet.write(row, 4, dict(action._fields['accomplishment_level'].selection).get(action.accomplishment_level, "No definido"), border_format)
            worksheet.write(row, 5, action.indicators or "", border_format)
            worksheet.write(row, 6, action.justification or "", border_format)
            worksheet.write(row, 7, str(action.action_date) if action.action_date else "", border_format)
            worksheet.write(row, 8, event.event_type_id.name if event.event_type_id else "", border_format)
            worksheet.write(row, 9, event.event_classification_id.description if event.event_classification_id else "", border_format)
            worksheet.write(row, 10, event.event_specification_id.description if event.event_specification_id else "", border_format)
            worksheet.write(row, 11, event.probability if event else "", border_format)
            worksheet.write(row, 12, event.impact if event else "", border_format)
            worksheet.write(row, 13, dict(event._fields['risk_level'].selection).get(event.risk_level, ""), border_format)
            worksheet.write(row, 14, event.existent_control_measures if event else "", border_format)
            worksheet.write(row, 15, dict(event._fields['actitude'].selection).get(event.actitude, ""), border_format)
            worksheet.write(row, 16, dict(event._fields['aptitude'].selection).get(event.aptitude, ""), border_format)
            worksheet.write(row, 17, dict(event._fields['new_risk_level'].selection).get(event.new_risk_level, ""), border_format)
            worksheet.write(row, 18, dict(event._fields['acceptance'].selection).get(event.acceptance, ""), border_format)
            worksheet.write(row, 19, str(event.creation_date) if event.creation_date else "", border_format)
            worksheet.write(row, 20, str(event.last_update) if event.last_update else "", border_format)
            worksheet.write(row, 21, dict(event._fields['status'].selection).get(event.status, ""), border_format)

            worksheet.set_row(row, None, wrap_format)
            row += 1

        worksheet.set_column('A:V', 20)
        worksheet.autofilter(0, 0, row - 1, len(headers) - 1)
    
        workbook.close()
        output.seek(0)

        return output.read(), "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Acciones_Propuestas_{}.xlsx".format(proposed_actions[0].event_id.display_name if proposed_actions else "report")

        
    def generate_compliance_chart(self, workbook, sheet, row_start):
        bold_centered_format = workbook.add_format({'bold': True, 'align': 'center', 'border': 1, 'bg_color': '#D9EAD3'})
        bold_format = workbook.add_format({'bold': True})
        number_format = workbook.add_format({'border': 1, 'align': 'center', 'bg_color': '#F4CCCC'})

        compliance_data_format = workbook.add_format({'border': 1, 'align': 'center', 'bg_color': '#EAD1DC'})
        
        chart = workbook.add_chart({'type': 'column'})
        compliance_data = {'Sí': 0, 'No': 0, 'Parcial': 0}

        for action in self.env['sev.proposed_action'].search([]):
            if action.accomplishment_level == 'yes':
                compliance_data['Sí'] += 1
            elif action.accomplishment_level == 'no':
                compliance_data['No'] += 1
            elif action.accomplishment_level == 'partial':  
                compliance_data['Parcial'] += 1


        sheet.write(row_start, 11, "Cumplimiento de Acciones", bold_centered_format)
        sheet.write(row_start + 1, 11, "Sí", bold_format)
        sheet.write(row_start + 2, 11, "No", bold_format)
        sheet.write(row_start + 3, 11, "Parcial", bold_format)

        sheet.write(row_start + 1, 12, compliance_data['Sí'], compliance_data_format)
        sheet.write(row_start + 2, 12, compliance_data['No'], compliance_data_format)
        sheet.write(row_start + 3, 12, compliance_data['Parcial'], compliance_data_format)

        chart.add_series({
            'name': 'Cumplimiento',
            'categories': [sheet.name, row_start + 1, 11, row_start + 3, 11],
            'values': [sheet.name, row_start + 1, 12, row_start + 3, 12]
        })

        chart.set_title({'name': 'Cumplimiento de Acciones'})
        chart.set_x_axis({'name': 'Nivel de Cumplimiento'})
        chart.set_y_axis({'name': 'Cantidad de Acciones'})
        chart.set_style(11)

        sheet.insert_chart(row_start + 5, 11, chart, {'x_scale': 2.0, 'y_scale': 2.0})

        return row_start + 10  


    def generate_internal_external_risk_chart(self, workbook, sheet, row_start):
        bold_centered_format = workbook.add_format({'bold': True, 'align': 'center', 'border': 1, 'bg_color': '#D9EAD3'})
        bold_format = workbook.add_format({'bold': True})
        number_format = workbook.add_format({'border': 1, 'align': 'center', 'bg_color': '#F4CCCC'})

        event_type_format = workbook.add_format({'border': 1, 'align': 'center', 'bg_color': '#EAD1DC'})
        
        chart = workbook.add_chart({'type': 'pie'})
        event_type_data = {'Interno': 0, 'Externo': 0}

        for action in self.env['sev.proposed_action'].search([]):
            event = action.event_id
            if event.event_type_id.name == 'Interno':
                event_type_data['Interno'] += 1
            elif event.event_type_id.name == 'Externo':
                event_type_data['Externo'] += 1

        sheet.write(row_start, 13, "Riesgo de Eventos Internos y Externos", bold_centered_format)
        sheet.write(row_start + 1, 13, "Interno", bold_format)
        sheet.write(row_start + 2, 13, "Externo", bold_format)

        sheet.write(row_start + 1, 14, event_type_data.get('Interno', 0), event_type_format)
        sheet.write(row_start + 2, 14, event_type_data.get('Externo', 0), event_type_format)

        chart.add_series({
            'name': 'Eventos Internos y Externos',
            'categories': [sheet.name, row_start + 1, 13, row_start + 2, 13],
            'values': [sheet.name, row_start + 1, 14, row_start + 2, 14]
        })

        chart.set_title({'name': 'Riesgo de Eventos Internos y Externos'})
        sheet.insert_chart(row_start + 5, 13, chart, {'x_scale': 2.0, 'y_scale': 2.0})

        return row_start + 10


    def generate_level_risk_chart(self, workbook, sheet, row_start):
        bold_centered_format = workbook.add_format({'bold': True, 'align': 'center', 'border': 1, 'bg_color': '#D9EAD3'})
        bold_format = workbook.add_format({'bold': True})
        number_format = workbook.add_format({'border': 1, 'align': 'center', 'bg_color': '#F4CCCC'})

        risk_level_format = workbook.add_format({'border': 1, 'align': 'center', 'bg_color': '#EAD1DC'})

        chart = workbook.add_chart({'type': 'column'})
        risk_data = {}

        for action in self.env['sev.proposed_action'].search([]):
            risk_level = action.event_id.risk_level
            if risk_level not in risk_data:
                risk_data[risk_level] = 0
            risk_data[risk_level] += 1

        sheet.write(row_start, 15, "Nivel de Riesgo de Acciones", bold_centered_format)
        sheet.write(row_start + 1, 15, "Bajo", bold_format)
        sheet.write(row_start + 2, 15, "Medio", bold_format)
        sheet.write(row_start + 3, 15, "Alto", bold_format)

        sheet.write(row_start + 1, 16, risk_data.get('low', 0), risk_level_format)
        sheet.write(row_start + 2, 16, risk_data.get('medium', 0), risk_level_format)
        sheet.write(row_start + 3, 16, risk_data.get('high', 0), risk_level_format)

        chart.add_series({
            'name': 'Nivel de Riesgo',
            'categories': [sheet.name, row_start + 1, 15, row_start + 3, 15],
            'values': [sheet.name, row_start + 1, 16, row_start + 3, 16]
        })

        chart.set_title({'name': 'Nivel de Riesgo de Acciones'})
        sheet.insert_chart(row_start + 5, 15, chart, {'x_scale': 2.0, 'y_scale': 2.0})

        return row_start + 10

