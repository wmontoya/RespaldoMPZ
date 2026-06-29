import io
import zipfile
import xlsxwriter
from odoo import models, api
import logging

_logger = logging.getLogger(__name__)

class ReportService(models.AbstractModel):
    _name = 'report.service'
    _description = 'Report Service'

    def generate_excel_report(self, department_evaluation_ids):
        department_evaluations = self.env['mm.evaluation.rel'].browse(department_evaluation_ids)

        evaluations_by_id = {}
        for dept_eval in department_evaluations:
            if dept_eval.evaluation_id.id not in evaluations_by_id:
                evaluations_by_id[dept_eval.evaluation_id.id] = {
                    'evaluation': dept_eval.evaluation_id,
                    'dept_evals': []
                }
            evaluations_by_id[dept_eval.evaluation_id.id]['dept_evals'].append(dept_eval)

        if len(evaluations_by_id) == 1:
            eval_id, eval_data = next(iter(evaluations_by_id.items()))
            evaluation_name = eval_data['evaluation'].title
            excel_file = self._generate_excel(eval_data['evaluation'], eval_data['dept_evals'])
            return excel_file, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', f'evaluation_report_{evaluation_name}.xlsx'
        else:
            zip_buffer = io.BytesIO()
            with zipfile.ZipFile(zip_buffer, 'a', zipfile.ZIP_DEFLATED, False) as zip_file:
                for eval_id, eval_data in evaluations_by_id.items():
                    evaluation_name = eval_data['evaluation'].title
                    excel_file = self._generate_excel(eval_data['evaluation'], eval_data['dept_evals'])
                    filename = f'evaluation_report_{evaluation_name}.xlsx'
                    zip_file.writestr(filename, excel_file)

            zip_buffer.seek(0)
            return zip_buffer.getvalue(), 'application/zip', 'evaluation_reports.zip'

    def _generate_excel(self, evaluation, dept_evals):
        output = io.BytesIO()
        workbook = xlsxwriter.Workbook(output, {'in_memory': True})
        worksheet = workbook.add_worksheet()

        section_colors = ['#5c8897', '#4ca3a6', '#56bca1', '#85d28c', '#c8e172']
        section_formats = [workbook.add_format({'bold': True, 'align': 'center', 'valign': 'vcenter', 'bg_color': color, 'border': 1}) for color in section_colors]
        cell_format = workbook.add_format({'border': 1, 'text_wrap': True})

        worksheet.write(0, 0, "Nombre evaluación:", workbook.add_format({'bold': True, 'align': 'center', 'valign': 'vcenter', 'border': 1, 'text_wrap': True}))
        worksheet.write(0, 1, evaluation.title, workbook.add_format({'bold': True, 'align': 'center', 'valign': 'vcenter', 'border': 1, 'text_wrap': True}))
        worksheet.write(0, 3, "Fecha inicio", workbook.add_format({'bold': True, 'align': 'center', 'valign': 'vcenter', 'border': 1, 'text_wrap': True}))
        worksheet.write(0, 4, str(evaluation.initial_date), workbook.add_format({'bold': True, 'align': 'center', 'valign': 'vcenter', 'border': 1, 'text_wrap': True}))
        worksheet.write(0, 6, "Fecha fin", workbook.add_format({'bold': True, 'align': 'center', 'valign': 'vcenter', 'border': 1, 'text_wrap': True}))
        worksheet.write(0, 7, str(evaluation.final_date), workbook.add_format({'bold': True, 'align': 'center', 'valign': 'vcenter', 'border': 1, 'text_wrap': True}))

        row = 2
        # section headers
        col = 0
        section_header_indices = {}
        for section_index, section in enumerate(evaluation.sections):
            section_format = section_formats[section_index % len(section_formats)]
            for question_index, question in enumerate(section.questions):
                unique_question_key = f"{question.title}_{question.id}"
                worksheet.write(row, col, question.title, section_format)
                section_header_indices[unique_question_key] = col
                worksheet.set_column(col, col, 15)  
                col += 1

        # column for averages
        avg_col = col
        worksheet.write(row, avg_col, 'Promedio por departamento', workbook.add_format({'bold': True, 'align': 'center', 'valign': 'vcenter', 'border': 1, 'text_wrap': True}))
        worksheet.set_column(avg_col, avg_col, 15) 

        # department header
        department_col = col + 1
        worksheet.write(row, department_col, 'Departamento', workbook.add_format({'bold': True, 'align': 'center', 'valign': 'vcenter', 'border': 1, 'text_wrap': True}))
        worksheet.set_column(department_col, department_col, 15)  

        row += 1

        for dept_eval in dept_evals:
            wrote_data = False
            values = []
            for section_index, section in enumerate(evaluation.sections):
                section_format = section_formats[section_index % len(section_formats)]
                for question_index, question in enumerate(section.questions):
                    unique_question_key = f"{question.title}_{question.id}"
                    col = section_header_indices[unique_question_key]
                    for option in question.options:
                        for answer in option.mm_answers.filtered(lambda a: a.evaluation_id == evaluation and a.department_id == dept_eval.department_id):
                            option_value = int(answer.option_value)
                            converted_value = min(max(option_value * 20, 20), 100)
                            worksheet.write(row, col, converted_value, section_format)
                            values.append(converted_value)
                            wrote_data = True

            if wrote_data:
                # Calculate and write average
                if values:
                    average_formula = f"=AVERAGE({','.join([f'{chr(65 + col)}{row + 1}' for col in range(len(values))])})"
                    worksheet.write_formula(row, avg_col, average_formula, cell_format)
                worksheet.write(row, department_col, dept_eval.department_id.name, cell_format)
                row += 1

        row += 2
        summary_row = row
        for section_index, section in enumerate(evaluation.sections):
            section_color = section_colors[section_index % len(section_colors)]
            summary_format = workbook.add_format({'bold': True, 'align': 'center', 'valign': 'vcenter', 'bg_color': section_color, 'num_format': '0.0', 'border': 1, 'text_wrap': True})

            start_col = section_header_indices[f"{section.questions[0].title}_{section.questions[0].id}"]
            end_col = section_header_indices[f"{section.questions[-1].title}_{section.questions[-1].id}"]

            worksheet.write(summary_row, start_col, section.name, summary_format)
            worksheet.write(summary_row, start_col + 1, f'Promedio {section.name}', summary_format)
            formula = f'=AVERAGE({chr(65 + start_col)}2:{chr(65 + end_col)}{row - 1})'
            worksheet.write(summary_row, start_col + 2, formula, summary_format)

        workbook.close()
        return output.getvalue()

