from odoo import models, fields


class BaseModel(models.AbstractModel):
    _name = "waste_control.base_model"
    _description = "Modelo Base"
    _abstract = True

    active = fields.Boolean(
        string="Activo",
        default=True,
        help="Visibilidad del registro. Si es falso se ocultará (Archivado)",
    )

    def toggle_active(self):
        for record in self:
            record.active = not record.active

    def button_save_and_close(self):
        """Save the changes and switch view"""
        self.ensure_one()
        self.write({"state": "done"}) if hasattr(self, "state") else None
        return self.action_switch_view()

    def action_switch_view(self):
        """Switch to the view of the specific model"""
        self.ensure_one()
        return {
            "name": self._description,
            "type": "ir.actions.act_window",
            "res_model": self._name,
            "view_mode": "tree,form",
            "target": "current",
            "context": self.env.context,
        }

    def button_delete(self):
        """Delete this and related records"""
        for rec in self:
            rec.active = False
        return self.action_switch_view()

    def button_cancel(self):
        """Don't save changes"""
        return self.action_switch_view()
