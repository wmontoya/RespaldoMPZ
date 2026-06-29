import json
import logging
from datetime import datetime
from odoo.http import Controller, Response, request, route
from ..services.survey_service import SurveyService


_logger = logging.getLogger(__name__)


class SurveyController(Controller):
    @route(
        "/api/v1/autoevaluation-survey/survey/byId/<string:survey_id>",
        type="http",
        auth="public",
        methods=["GET"],
    )
    def survey_by_id(self, survey_id):
        survey = request.env["ae.survey"].sudo().search([("id", "=", survey_id)])
        if survey:
            survey_res = SurveyService._parse_single_survey(survey)
            return Response(
                json.dumps(survey_res),
                content_type="application/json;charset=utf-8",
                status=200,
            )
        return request.not_found()

    @route(
        "/api/v1/autoevaluation-survey/surveys/<string:department_id>",
        type="http",
        auth="public",
        methods=["GET"],
    )
    def surveys(self, department_id):
        surveys_rel = (
            request.env["ae.survey.rel"]
            .sudo()
            .search([("department_id.id", "=", department_id)])
        )
        surveys = [rel.survey_id for rel in surveys_rel if rel.survey_id.status != "active"]
        if surveys:
            surveys_res = SurveyService.parse_surveys(surveys)
            return Response(
                json.dumps(surveys_res),
                content_type="application/json;charset=utf-8",
                status=200,
            )
        return request.not_found()

    @route(
        "/api/v1/autoevaluation-survey/survey/verify",
        type="http",
        auth="public",
        methods=["PUT"],
        csrf=False,
    )
    def verify_status(self, **kwargs):
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

        survey_id = data.get("survey_id")
        department_id = data.get("department_id")

        if department_id is None or survey_id is None:
            return Response(
                json.dumps({"error": "Missing required fields"}),
                content_type="application/json;charset=utf-8",
                status=400,
            )

        try:
            department_survey = (
                request.env["ae.survey.rel"]
                .sudo()
                .search(
                    [
                        ("survey_id", "=", survey_id),
                        ("department_id", "=", department_id),
                    ],
                    limit=1,
                )
            )

            if department_survey:
                res = {
                    "survey_id": department_survey.survey_id.id,
                    "department_id": department_survey.department_id.id,
                    "status": department_survey.status,
                    "score": department_survey.score,
                }
                return Response(
                    json.dumps(res),
                    content_type="application/json;charset=utf-8",
                    status=200,
                )
            else:
                return request.not_found()
        except Exception as e:
            _logger.error("Error verifying survey status: %s", e, exc_info=True)
            return Response(
                json.dumps({"error": str(e)}),
                content_type="application/json;charset=utf-8",
                status=500,
            )

    # @route(
    #     "/api/v1/autoevaluation-survey/survey/completed",
    #     type="http",
    #     auth="public",
    #     methods=["PUT"],
    #     csrf=False,
    # )
    # def change_status(self, **kwargs):
    #     try:
    #         data = json.loads(request.httprequest.data)
    #     except ValueError:
    #         return Response(
    #             json.dumps({"error": "Invalid JSON"}),
    #             content_type="application/json;charset=utf-8",
    #             status=400,
    #         )

    #     if not data:
    #         return Response(
    #             json.dumps({"error": "No data received"}),
    #             content_type="application/json;charset=utf-8",
    #             status=400,
    #         )

    #     survey_id = data.get("survey_id")
    #     department_id = data.get("department_id")
    #     score = data.get("score")

    #     if department_id is None or survey_id is None:
    #         return Response(
    #             json.dumps({"error": "Missing required fields"}),
    #             content_type="application/json;charset=utf-8",
    #             status=400,
    #         )

    #     try:
    #         department_survey = (
    #             request.env["ae.survey.rel"]
    #             .sudo()
    #             .search(
    #                 [
    #                     ("survey_id", "=", survey_id),
    #                     ("department_id", "=", department_id),
    #                 ],
    #                 limit=1,
    #             )
    #         )

    #         if department_survey:
    #             department_survey.sudo().write({"status": "finished", "score": score})
    #             res = {
    #                 "survey_id": department_survey.survey_id.id,
    #                 "department_id": department_survey.department_id.id,
    #                 "status": department_survey.status,
    #                 "score": department_survey.score,
    #             }
    #             return Response(
    #                 json.dumps(res),
    #                 content_type="application/json;charset=utf-8",
    #                 status=200,
    #             )
    #         else:
    #             return request.not_found()
    #     except Exception as e:
    #         _logger.error("Error changing survey status: %s", e, exc_info=True)
    #         return Response(
    #             json.dumps({"error": str(e)}),
    #             content_type="application/json;charset=utf-8",
    #             status=500,
    #         )

    @route(
        "/api/v1/autoevaluation-survey/component/<string:component_id>",
        type="http",
        auth="public",
        methods=["GET"],
    )
    def get_component(self, component_id):
        component = request.env["ae.component"].sudo().search([("id", "=", component_id)])
        if component:
            component_res = {
                "id": component.id,
                "title": component.title,
                "survey_id": component.survey_id.id,
                "sections": SurveyService._parse_sections(component.sections),
            }
            return Response(
                json.dumps(component_res),
                content_type="application/json;charset=utf-8",
                status=200,
            )
        return Response(
            json.dumps({"error": "Component not found"}),
            content_type="application/json;charset=utf-8",
            status=404,
        )

    @route(
        "/api/v1/autoevaluation-survey/survey/actual",
        type="http",
        auth="public",
        methods=["GET"],
        csrf=False,
    )
    def actual_evaluation(self):
        try:
            current_date = datetime.now().date()

            surveys = (
                request.env["ae.survey"]
                .sudo()
                .search([
                    ("initial_date", "<=", current_date),
                    ("final_date", ">=", current_date),
                    ("status", "=", "active"),
                ])
            )

            if surveys:
                survey = SurveyService.compare_dates(surveys, current_date)
                if survey:
                    return Response(
                        json.dumps({
                            "has_active_survey": True,
                            "survey": survey,
                        }),
                        status=200,
                        content_type="application/json",
                    )

            # 👉 NO ES ERROR
            return Response(
                json.dumps({
                    "has_active_survey": False,
                    "survey": None,
                    "message": "No hay encuestas activas en este momento"
                }),
                status=200,
                content_type="application/json",
            )

        except Exception as e:
            _logger.exception("Error obteniendo encuesta activa")
            return Response(
                json.dumps({
                    "error": "internal_error",
                    "message": str(e),
                }),
                status=500,
                content_type="application/json",
            )
