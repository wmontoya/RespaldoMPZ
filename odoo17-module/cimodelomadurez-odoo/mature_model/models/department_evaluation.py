from odoo import fields, models


class DepartmentEvaluation(models.Model):
    _name = "mm.evaluation.rel"
    _description = "Evaluación del Departamento"

    department_id = fields.Many2one(
        "hr.department", string="Departamento", ondelete="cascade"
    )
    evaluation_id = fields.Many2one(
        "mm.evaluation", string="Evaluación", ondelete="cascade"
    )
    status = fields.Selection(
        [
            ("pending", "Pendiente"),
            ("finished", "Finalizado"),
        ],
        default="pending",
        string="Estado",
    )
    score = fields.Float(string="Puntuación", default=0.0)

    def generate_department_report(self):
        selected_departments_ids = self.ids
        return {
            "type": "ir.actions.act_url",
            "url": "/api/v1/department/download_excel_report?department_ids="
            + ",".join(map(str, selected_departments_ids)),
            "target": "new",
        }
