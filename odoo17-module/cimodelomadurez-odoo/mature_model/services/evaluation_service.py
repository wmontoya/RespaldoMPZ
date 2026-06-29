from datetime import datetime


class EvaluationService:

    @staticmethod
    def compare_dates(evaluations, current_date):
        evaluations_res = EvaluationService.parse_evaluations(evaluations)
        for evaluation in evaluations_res:
            initial_date = datetime.strptime(
                evaluation["initial_date"], "%Y-%m-%d"
            ).date()
            final_date = datetime.strptime(evaluation["final_date"], "%Y-%m-%d").date()
            if (
                initial_date <= current_date
                and final_date >= current_date
                and evaluation["status"] == "active"
            ):
                return evaluation
        return None

    @staticmethod
    def parse_evaluations(evaluations):
        return [
            EvaluationService._parse_single_evaluation(evaluation)
            for evaluation in evaluations
        ]

    @staticmethod
    def _parse_single_evaluation(evaluation):
        return {
            "id": evaluation.id,
            "title": evaluation.title,
            "status": evaluation.status,
            "initial_date": EvaluationService._format_date(evaluation.initial_date),
            "final_date": EvaluationService._format_date(evaluation.final_date),
            "departments": EvaluationService._parse_departments(evaluation.departments),
            "sections": EvaluationService._parse_sections(evaluation.sections),
            "proposed_actions": EvaluationService.parse_proposed_actions(
                evaluation.proposed_actions
            ),
        }

    @staticmethod
    def parse_proposed_actions(proposed_actions):
        return [
            EvaluationService._parse_proposed_action(proposed_action)
            for proposed_action in proposed_actions
        ]

    @staticmethod
    def _parse_proposed_action(proposed_action):
        return {
            "id": proposed_action.id,
            "user_id": proposed_action.user_id.id,
            "evaluation_id": proposed_action.evaluation_id.id,
            "description": proposed_action.description,
            "indicators": proposed_action.indicators,
            "responsible_name": proposed_action.responsible_name,
            "responsible_email": proposed_action.responsible_email,
            "accomplishment_level": proposed_action.accomplishment_level,
            "justification": proposed_action.justification,
            "action_date": EvaluationService._format_date(proposed_action.action_date),
        }

    @staticmethod
    def _parse_departments(departments):
        return [
            EvaluationService._parse_department(department)
            for department in departments
        ]

    @staticmethod
    def _parse_department(department):
        return {
            "id": department.id,
            "name": department.name,
            "unit_id": department.unit_id.id,
            "answers": [
                EvaluationService._parse_answer(answer)
                for answer in department.mm_answers
            ],
        }

    @staticmethod
    def _parse_sections(sections):
        return [EvaluationService._parse_section(section) for section in sections]

    @staticmethod
    def _parse_section(section):
        return {
            "id": section.id,
            "name": section.name,
            "description": section.description,
            "questions": [
                EvaluationService._parse_question(question)
                for question in section.questions
            ],
        }

    @staticmethod
    def _parse_question(question):
        return {
            "id": question.id,
            "title": question.title,
            "description": question.description,
            "section": {
                "id": question.section_id.id,
                "name": question.section_id.name,
                "description": question.section_id.description,
            },
            "options": [
                EvaluationService._parse_option(option) for option in question.options
            ],
        }

    @staticmethod
    def _parse_option(option):
        return {
            "id": option.id,
            "description": option.description,
            "value": option.value,
            "question_id": {
                "id": option.question_id.id,
                "title": option.question_id.title,
                "description": option.question_id.description,
            },
            "answers": [
                EvaluationService._parse_answer(answer) for answer in option.mm_answers
            ],
        }

    @staticmethod
    def _parse_answer(answer):
        return {
            "id": answer.id,
            "description": answer.description,
            "option_id": answer.option_id.id,
            "department_id": answer.department_id.id,
            "evaluation_id": answer.evaluation_id.id,
        }

    @staticmethod
    def _format_date(date):
        return date.strftime("%Y-%m-%d") if date else None
