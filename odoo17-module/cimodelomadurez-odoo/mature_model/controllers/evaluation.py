# -*- coding: utf-8 -*-

import io
import json
import logging
import xlsxwriter
from datetime import datetime
from odoo.http import Controller, Response, request, route
from ..services.evaluation_service import EvaluationService


_logger = logging.getLogger(__name__)


class EvaluationController(Controller):
    @route(
        "/api/v1/mature-model/evaluations/<string:department_id>",
        type="http",
        auth="public",
        methods=["GET"],
    )
    def evaluations(self, department_id):
        evaluations_rel = (
            request.env["mm.evaluation.rel"]
            .sudo()
            .search([("department_id.id", "=", department_id)])
        )
        evaluations = [rel.evaluation_id for rel in evaluations_rel if rel.evaluation_id.status != "active"]

        # evaluations = request.env["mm.evaluation"].sudo().search([ ])
        if evaluations:
            evaluations_res = EvaluationService.parse_evaluations(evaluations)
            return Response(
                json.dumps(evaluations_res),
                content_type="application/json;charset=utf-8",
                status=200,
            )
        return request.not_found()

    @route(
        "/api/v1/mature-model/evaluations/actual",
        type="http",
        auth="public",
        methods=["GET"],
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
        return request.not_found()

    @route(
        "/api/v1/mature-model/evaluations/byId/<string:id>",
        type="http",
        auth="public",
        methods=["GET"],
    )
    def evaluations_by_id(self, id):
        evaluation = (
            request.env["mm.evaluation"].sudo().search([("id", "=", id)], limit=1)
        )
        if evaluation:
            evaluation_res = EvaluationService._parse_single_evaluation(evaluation)
            return Response(
                json.dumps(evaluation_res),
                content_type="application/json;charset=utf-8",
                status=200,
            )
        return Response(
            json.dumps({"error": "Evaluation not found"}),
            content_type="application/json;charset=utf-8",
            status=404,
        )

    @route(
        "/api/v1/mature-model/evaluations/answer",
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

    @route(
        "/api/v1/mature-model/evaluations/verify",
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
                return request.not_found()

        except Exception as e:
            return Response(
                json.dumps({"error": str(e)}),
                content_type="application/json;charset=utf-8",
                status=500,
            )

    @route(
        "/api/v1/mature-model/evaluations/completed",
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
                return request.not_found()

        except Exception as e:
            return Response(
                json.dumps({"error": str(e)}),
                content_type="application/json;charset=utf-8",
                status=500,
            )
