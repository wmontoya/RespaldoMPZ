from datetime import datetime


class SurveyService:
    @staticmethod
    def compare_dates(surveys, current_date):
        surveys_res = SurveyService.parse_surveys(surveys)
        for survey in surveys_res:
            initial_date = datetime.strptime(survey["initial_date"], "%Y-%m-%d").date()
            final_date = datetime.strptime(survey["final_date"], "%Y-%m-%d").date()
            if (
                initial_date <= current_date
                and final_date >= current_date
                and survey["status"] == "active"
            ):
                return survey
        return None

    @staticmethod
    def parse_surveys(surveys):
        return [SurveyService._parse_single_survey(survey) for survey in surveys]

    @staticmethod
    def _parse_components(components):
        return [SurveyService._parse_component(component) for component in components]

    @staticmethod
    def _parse_component(component):
        return {
            "id": component.id,
            "title": component.title,
            "survey_id": component.survey_id.id,
            "sections": SurveyService._parse_sections(component.sections),
        }

    @staticmethod
    def _parse_sections(sections):
        return [SurveyService._parse_section(section) for section in sections]

    @staticmethod
    def _parse_section(section):
        return {
            "id": section.id,
            "title": section.title,
            "description": section.description,
            "questions": [
                SurveyService._parse_question(question)
                for question in section.questions
            ],
        }

    @staticmethod
    def _parse_answer(answer):
        return {
            "id": answer.id,
            "response": answer.response,
            "document": answer.document.decode("utf-8") if answer.document else None, 
            "department_id": answer.department_id.id,
            "question_id": answer.question_id.id,
            "component_id": answer.component_id.id,
            "survey_id": answer.survey_id.id,
        }

    @staticmethod
    def _parse_question(question):
        return {
            "id": question.id,
            "title": question.title,
            "description": question.description,
            "section": {
                "id": question.section_id.id,
                "title": question.section_id.title,
                "description": question.section_id.description,
            },
            "answers": [
                SurveyService._parse_answer(answer) for answer in question.aes_answers
            ],
        }

    @staticmethod
    def _parse_single_survey(survey):
        return {
            "id": survey.id,
            "title": survey.title,
            "status": survey.status,
            "initial_date": SurveyService._format_date(survey.initial_date),
            "final_date": SurveyService._format_date(survey.final_date),
            "departments": SurveyService._parse_departments(survey.departments),
            "components": SurveyService._parse_components(survey.components), 
        }
 
    @staticmethod
    def _parse_department(department):
        return {
            "id": department.id,
            "name": department.name,
            "unit_id": department.unit_id.id,
            "answers": [
                SurveyService._parse_answer(answer) for answer in department.aes_answers
            ],
        }

    @staticmethod
    def _parse_departments(departments):
        return [
            SurveyService._parse_department(department) for department in departments
        ]

    @staticmethod
    def _format_date(date):
        return date.strftime("%Y-%m-%d") if date else None
