# -*- coding: utf-8 -*-

import json
import io
import xlsxwriter
from datetime import datetime
from odoo import http
from odoo.http import Response, request
from ..services.evaluation_service import EvaluationService
import logging

_logger = logging.getLogger(__name__)


class EvaluationController(http.Controller):
    @http.route("/api/v1/evaluations", type="http", auth="public", methods=["GET"])
    def evaluations(self):
        evaluations = request.env["mm.evaluation"].sudo().search([])
        if evaluations:
            evaluations_res = EvaluationService.parse_evaluations(evaluations)
            return Response(
                json.dumps(evaluations_res),
                content_type="application/json;charset=utf-8",
                status=200,
            )
        return Response(
            json.dumps({"error": "There is no evaluations."}),
            content_type="application/json;charset=utf-8",
            status=404,
        )

    @http.route(
        "/api/v1/evaluations/actual", type="http", auth="public", methods=["GET"]
    )
    def actual_evaluation(self):
        current_date = datetime.now().date()
        evaluations = (
            request.env["mm.evaluation"]
            .sudo()
            .search(
                [
                    ("initial_date", "<=", current_date),
                    ("final_date", ">=", current_date),
                    ("status", "=", "active"),
                ]
            )
        )

        if evaluations:
            evaluation = EvaluationService.compare_dates(evaluations, current_date)
            if evaluation:
                return Response(
                    json.dumps(evaluation),
                    content_type="application/json;charset=utf-8",
                    status=200,
                )
        return Response(
            json.dumps({"error": "There is no active evaluation."}),
            content_type="application/json;charset=utf-8",
            status=404,
        )

    @http.route(
        "/api/v1/evaluations/<string:title>",
        type="http",
        auth="public",
        methods=["GET"],
    )
    def evaluations_by_title(self, title):
        evaluations = (
            request.env["mm.evaluation"].sudo().search([("title", "=", title)])
        )

        if evaluations:
            evaluation_res = EvaluationService.parse_evaluations(evaluations)
            return Response(
                json.dumps(evaluation_res),
                content_type="application/json;charset=utf-8",
                status=200,
            )
        else:
            return Response(
                json.dumps({"error": "Evaluation not found"}),
                content_type="application/json;charset=utf-8",
                status=404,
            )

    @http.route(
        "/api/v1/evaluations/answer",
        type="http",
        auth="public",
        methods=["POST"],
        csrf=False,
    )
    def save_answer(self, **data):
        try:
            data = json.loads(request.httprequest.data)
        except ValueError:
            return Response(
                json.dumps({"error": "Invalid JSON"}),
                content_type="application/json;charset=utf-8",
                status=400,
            )

        if not data:
            return Response(
                json.dumps({"error": "No data received"}),
                content_type="application/json;charset=utf-8",
                status=400,
            )

        option_id = data.get("option_id")
        department_id = data.get("department_id")
        evaluation_id = data.get("evaluation_id")

        if option_id is None or department_id is None or evaluation_id is None:
            return Response(
                json.dumps({"error": "Missing required fields"}),
                content_type="application/json;charset=utf-8",
                status=400,
            )

        try:
            answer = (
                request.env["mm.answer"]
                .sudo()
                .create(
                    {
                        "option_id": option_id,
                        "department_id": department_id,
                        "evaluation_id": evaluation_id,
                    }
                )
            )
        except Exception as e:
            return Response(
                json.dumps({"error": str(e)}),
                content_type="application/json;charset=utf-8",
                status=500,
            )

        res = {
            "id": answer.id,
            "option_id": answer.option_id.id,
            "department_id": answer.department_id.id,
            "option_description": answer.option_description,
            "department_name": answer.department_name,
            "evaluation_id": answer.evaluation_id.id,
        }

        return Response(
            json.dumps(res), content_type="application/json;charset=utf-8", status=200
        )

    @http.route(
        "/api/v1/evaluations/verify",
        type="http",
        auth="public",
        methods=["PUT"],
        csrf=False,
    )
    def verify_state(self, **data):
        try:
            data = json.loads(request.httprequest.data)
        except ValueError:
            return Response(
                json.dumps({"error": "Invalid JSON"}),
                content_type="application/json;charset=utf-8",
                status=400,
            )

        if not data:
            return Response(
                json.dumps({"error": "No data received"}),
                content_type="application/json;charset=utf-8",
                status=400,
            )

        department_id = data.get("department_id")
        evaluation_id = data.get("evaluation_id")

        if department_id is None or evaluation_id is None:
            return Response(
                json.dumps({"error": "Missing required fields"}),
                content_type="application/json;charset=utf-8",
                status=400,
            )

        try:
            department_evaluation = (
                request.env["mm.evaluation.rel"]
                .sudo()
                .search(
                    [
                        ("department_id", "=", department_id),
                        ("evaluation_id", "=", evaluation_id),
                    ],
                    limit=1,
                )
            )

            if department_evaluation:
                res = {
                    "department_id": department_evaluation.department_id.id,
                    "evaluation_id": department_evaluation.evaluation_id.id,
                    "state": department_evaluation.status,
                    "score": department_evaluation.score,
                }
                return Response(
                    json.dumps(res),
                    content_type="application/json;charset=utf-8",
                    status=200,
                )
            else:
                return Response(
                    json.dumps({"error": "Evaluation relation not found"}),
                    content_type="application/json;charset=utf-8",
                    status=404,
                )

        except Exception as e:
            return Response(
                json.dumps({"error": str(e)}),
                content_type="application/json;charset=utf-8",
                status=500,
            )
    @http.route(
        "/api/v1/evaluations/completed",
        type="http",
        auth="public",
        methods=["PUT"],
        csrf=False,
    )     
    def change_state(self, **data):
        try:
            data = json.loads(request.httprequest.data)
        except ValueError:
            return Response(
                json.dumps({"error": "Invalid JSON"}),
                content_type="application/json;charset=utf-8",
                status=400,
            )

        if not data:
            return Response(
                json.dumps({"error": "No data received"}),
                content_type="application/json;charset=utf-8",
                status=400,
            )

        department_id = data.get("department_id")
        evaluation_id = data.get("evaluation_id")
        score = data.get("score")

        if department_id is None or evaluation_id is None:
            return Response(
                json.dumps({"error": "Missing required fields"}),
                content_type="application/json;charset=utf-8",
                status=400,
            )

        try:
            department_evaluation = (
                request.env["mm.evaluation.rel"]
                .sudo()
                .search(
                    [
                        ("department_id", "=", department_id),
                        ("evaluation_id", "=", evaluation_id),
                    ],
                    limit=1,
                )
            )

            if department_evaluation:
                department_evaluation.sudo().write(
                    {"status": "finished", "score": score}
                )
                res = {
                    "department_id": department_evaluation.department_id.id,
                    "evaluation_id": department_evaluation.evaluation_id.id,
                    "state": department_evaluation.status,
                    "score": department_evaluation.score,
                }
                return Response(
                    json.dumps(res),
                    content_type="application/json;charset=utf-8",
                    status=200,
                )
            else:
                return Response(
                    json.dumps({"error": "Evaluation relation not found"}),
                    content_type="application/json;charset=utf-8",
                    status=404,
                )

        except Exception as e:
            return Response(
                json.dumps({"error": str(e)}),
                content_type="application/json;charset=utf-8",
                status=500,
            )

    @http.route(
        "/api/v1/answers/download_excel_report/<int:report_id>",
        type="http",
        auth="user",
        csrf=False,
    )
    def evaluation_excel_report(self, report_id):
        try:
            report = request.env["mm.report"].browse(report_id)
            if not report.exists():
                _logger.warning("Report ID %s does not exist", report_id)
                return request.not_found()

            evaluation = report.evaluation_id
            if not evaluation:
                _logger.warning("No evaluation found for report ID %s", report_id)
                return request.not_found()

            output = io.BytesIO()
            workbook = xlsxwriter.Workbook(output, {"in_memory": True})
            worksheet = workbook.add_worksheet()

            section_colors = ["#ADD8E6", "#ca92f0", "#90EE90", "#D3D3D3", "#FFDAB9"]

            section_formats = [
                workbook.add_format(
                    {
                        "bold": True,
                        "align": "center",
                        "valign": "vcenter",
                        "bg_color": color,
                    }
                )
                for color in section_colors
            ]

            # section headers
            col = 0
            section_header_indices = {}
            for section_index, section in enumerate(evaluation.sections):
                section_format = section_formats[section_index % len(section_formats)]
                for question in section.questions:
                    worksheet.write(0, col, question.title, section_format)
                    section_header_indices[question.title] = col
                    worksheet.set_column(col, col, 15)  # Ajustar ancho de columna
                    col += 1

            # column for averages
            avg_col = col
            worksheet.write(
                0,
                avg_col,
                "Promedio por departamento",
                workbook.add_format(
                    {"bold": True, "align": "center", "valign": "vcenter"}
                ),
            )

            # department header
            department_col = col + 1
            worksheet.write(
                0,
                department_col,
                "Departamento",
                workbook.add_format(
                    {"bold": True, "align": "center", "valign": "vcenter"}
                ),
            )

            row = 1
            departments = evaluation.departments

            answers_by_department = {}
            for department in departments:
                answers_by_department[department.id] = []

            for answer in evaluation.mm_answers:
                if answer.department_id.id in answers_by_department:
                    answers_by_department[answer.department_id.id].append(answer)

            for department_id, answers in answers_by_department.items():
                wrote_data = False
                values = []
                for section_index, section in enumerate(evaluation.sections):
                    section_format = section_formats[
                        section_index % len(section_formats)
                    ]
                    for question in section.questions:
                        col = section_header_indices[question.title]
                        for option in question.options:
                            for answer in option.mm_answers.filtered(
                                lambda a: a.evaluation_id == evaluation
                                and a.department_id.id == department_id
                            ):
                                option_value = int(answer.option_value)
                                converted_value = min(max(option_value * 20, 20), 100)
                                worksheet.write(
                                    row, col, converted_value, section_format
                                )
                                values.append(converted_value)
                                wrote_data = True

                if wrote_data:
                    # Calculate and write average
                    if values:
                        average_formula = f"=AVERAGE({','.join([f'{chr(65 + col)}{row + 1}' for col in range(len(values))])})"
                        worksheet.write_formula(row, avg_col, average_formula)
                    worksheet.write(row, department_col, answer.department_name)
                    row += 1

            row += 2
            summary_row = row
            for section_index, section in enumerate(evaluation.sections):
                section_color = section_colors[section_index % len(section_colors)]
                summary_format = workbook.add_format(
                    {
                        "bold": True,
                        "align": "center",
                        "valign": "vcenter",
                        "bg_color": section_color,
                        "num_format": "0.0",
                    }
                )

                start_col = section_header_indices[section.questions[0].title]
                end_col = section_header_indices[section.questions[-1].title]

                worksheet.write(summary_row, start_col, section.name, summary_format)
                worksheet.write(
                    summary_row,
                    start_col + 1,
                    f"Promedio {section.name}",
                    summary_format,
                )
                formula = (
                    f"=AVERAGE({chr(65 + start_col)}2:{chr(65 + end_col)}{row - 1})"
                )
                worksheet.write(summary_row, start_col + 2, formula, summary_format)

            workbook.close()
            output.seek(0)

            filename = f"evaluation_report_{evaluation.id}.xlsx"
            response = request.make_response(
                output.read(),
                headers=[
                    ("Content-Disposition", f"attachment; filename={filename}"),
                    (
                        "Content-Type",
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    ),
                ],
            )
            return response
        except Exception as e:
            _logger.error("Error generating Excel report: %s", e, exc_info=True)
            return request.not_found()
