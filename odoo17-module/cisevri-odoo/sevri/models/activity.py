from odoo import models, fields, api
from odoo.exceptions import ValidationError


class Activity(models.Model):
    _name = "sev.activity"
    _description = "Actividad"
    _rec_name = "title"

    title = fields.Char(string="Título", required=True)
    subtitle = fields.Char(string="Subtítulo", required=True)
    activity_date = fields.Date(string="Fecha de Actividad", default=fields.Date.today)
    dependency = fields.Char(string="Dependencia", related="department_id.name", store=True)
    procedure_to_follow = fields.Char(string="Procedimiento a Seguir")
    sevri_process_id = fields.Many2one("sev.process", string="Proceso", default=lambda self: self._get_active_process())
    department_id = fields.Many2one("hr.department", string="Departamento", default=lambda self: self._get_user_department())
    events = fields.One2many("sev.event", "activity_id", string="Eventos")

    def search(self, args=None, offset=0, limit=None, order=None, count=False):
        if self.env.user.has_group("sevri.res_groups_sevri_internal_control"):
            employee = self.env["hr.employee"].search([("user_id", "=", self.env.user.id)], limit=1)
            department_id = employee.department_id.id if employee.department_id else False
            if department_id:
                args = (args or []) + [("department_id", "child_of", department_id)]
            else:
                args = (args or []) + [("id", "=", False)]
        return super().search(args, offset=offset, limit=limit, order=order, count=count)

    @api.model
    def _get_active_process(self):
        active_processes = self.env["sev.process"].search([
            ("status", "=", "active")
        ])

        if len(active_processes) > 1:
            raise ValidationError(
                "Existe más de un proceso en estado activo. "
                "Solo puede existir un único proceso activo."
            )

        return active_processes[:1].id if active_processes else False
    
    @api.model
    def _get_user_department(self):
        employee = self.env["hr.employee"].search([
            ("user_id", "=", self.env.user.id)
        ], limit=1)

        return employee.department_id.id if employee.department_id else False
    

    @api.model_create_multi
    def create(self, vals_list):
        active_process = self.env["sev.process"].search([
            ("status", "=", "active")
        ], limit=1)

        if not active_process:
            raise ValidationError(
                "No existe un proceso activo. No se pueden crear actividades."
            )

        return super().create(vals_list)

    def write(self, vals):
        for record in self:
            if not record.sevri_process_id:
                raise ValidationError(
                    "La actividad no tiene un proceso asociado."
                )

            if record.sevri_process_id.status != "active":
                raise ValidationError(
                    "No puede modificar esta actividad porque el proceso asociado ya no está activo."
                )

        return super().write(vals)
        