# -*- coding: utf-8 -*-

import json
from odoo import http
from odoo.http import Response, request


class AnswerController(http.Controller):
    @http.route(
        "/api/v1/answers/<int:id>",
        type="http",
        auth="public",
        methods=["PUT"],
        csrf=False,
    )
    def update_answer(self, id, **data):
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
            answer = request.env["mm.answer"].sudo().browse(id)
            if not answer:
                return Response(
                    json.dumps({"error": "Answer not found"}),
                    content_type="application/json;charset=utf-8",
                    status=404,
                )

            answer.write(
                {
                    "option_id": option_id,
                    "department_id": department_id,
                    "evaluation_id": evaluation_id,
                }
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
