# -*- coding: utf-8 -*-

import json
import logging
import base64
from odoo.http import Controller, Response, request, route


_logger = logging.getLogger(__name__)


class AnswerController(Controller):
    @route(
        "/api/v1/autoevaluation-survey/answers",
        type="http",
        auth="public",
        methods=["POST"],
        csrf=False,
    )
    def save_answer(self, **data):
        try:
            data = request.httprequest.data
            decoded_data = data.decode("utf-8")
            data = json.loads(decoded_data)

            _logger.info("Data: %s", data)
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
        response = data.get("response")
        document = data.get("document") 
        question_id = data.get("question_id")
        component_id = data.get("component_id")
        survey_id = data.get("survey_id") 
        department_id = data.get("department_id")
        
        # If department_id is not provided, get it from the current user
        if not department_id:
            current_user = request.env.user
            if current_user.employee_id and current_user.employee_id.department_id:
                department_id = current_user.employee_id.department_id.id
            else:
                return Response(
                    json.dumps({"error": "Could not determine user department"}),
                    content_type="application/json;charset=utf-8",
                    status=400,
                )
        
        if response is None or question_id is None or component_id is None:
            return Response(
                json.dumps({"error": "Missing required fields"}),
                content_type="application/json;charset=utf-8",
                status=400,
            )
        try:
            answer = (
                request.env["ae.answer"]
                .sudo()
                .create(
                    {
                        "response": response,
                        "document": document, 
                        "survey_id": survey_id,  
                        "question_id": question_id,
                        "component_id": component_id,
                        "department_id": department_id,
                    }
                )
            )
        except Exception as e:
            _logger.error("Error creating answer: %s", str(e))
            return Response(
                json.dumps({"error": str(e)}),
                content_type="application/json;charset=utf-8",
                status=500,
            )
        res = {
            "id": answer.id,
            "response": answer.response,
            "document": answer.document.decode("utf-8") if answer.document else None,   
            "survey_id": answer.survey_id.id,
            "question_id": answer.question_id.id,
            "component_id": answer.component_id.id,
            "department_id": answer.department_id.id,
        }
        return Response(
            json.dumps(res), content_type="application/json;charset=utf-8", status=201
        )

    @route(
        "/api/v1/autoevaluation-survey/answers/<int:id>",
        type="http",
        auth="public",
        methods=["PUT"],
        csrf=False,
    )
    def update_answer(self, id, **kwargs):
        try:
            data = request.httprequest.data
            decoded_data = data.decode("utf-8")
            data = json.loads(decoded_data)
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

        question_id = data.get("question_id")
        component_id = data.get("component_id")
        response = data.get("response")
        document = data.get("document")
        survey_id = data.get("survey_id")
        department_id = data.get("department_id")
        
        # If department_id is not provided, get it from the current user
        if not department_id:
            current_user = request.env.user
            if current_user.employee_id and current_user.employee_id.department_id:
                department_id = current_user.employee_id.department_id.id
            else:
                return Response(
                    json.dumps({"error": "Could not determine user department"}),
                    content_type="application/json;charset=utf-8",
                    status=400,
                )

        if question_id is None or component_id is None:
            return Response(
                json.dumps({"error": "Missing required fields"}),
                content_type="application/json;charset=utf-8",
                status=400,
            )

        try:
            answer = request.env["ae.answer"].sudo().browse(id)
            if not answer:
                return request.not_found()

            answer.write(
                {
                    "question_id": question_id,
                    "component_id": component_id,
                    "department_id": department_id,
                    "response": response,
                    "survey_id": survey_id,
                    "document": document,
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
            "question_id": answer.question_id.id,
            "component_id": answer.component_id.id,
            "survey_id": answer.survey_id.id,
            "response": answer.response,
            "department_id": answer.department_id.id,
            "document": answer.document.decode("utf-8") if answer.document else None,
        }

        return Response(
            json.dumps(res), content_type="application/json;charset=utf-8", status=200
        )
