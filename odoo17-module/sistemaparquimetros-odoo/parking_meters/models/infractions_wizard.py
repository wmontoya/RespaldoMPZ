from odoo import models, fields, api
from datetime import datetime
from odoo.exceptions import UserError


class InfractionsWizard(models.TransientModel):
    _name = "parking_meters.infractions_wizard"
    _description = "Wizards para pagar múltiples infracciones"

    infraction_ids = fields.Many2many("parking_meters.infraction", string="Infracciones")
    cancellation_description = fields.Text(string="Cancellation Description")
    payment_type_ids = fields.One2many("parking_meters.payment_type",'wizard_id', string="Tipos de Pago")
    infraction_payment_ticket = fields.Html(
        string="Ticket de pago",
        related='infraction_ids.infraction_payment_ticket',
        sanitize=False,
        readonly=True
    )
    
    all_registered = fields.Boolean(string='Todas Registradas', compute='_compute_all_registered')

    @api.depends('infraction_ids.infraction_state_id')
    def _compute_all_registered(self):
        for wizard in self:
            wizard.all_registered = all(
                infraction.infraction_state_id.description == 'REGISTRADO'
                for infraction in wizard.infraction_ids
            )

    def button_invoice_print(self):
        pass
    
    def action_confirm(self):
        return self.insert_new_payment_action(force=True)

    def insert_new_payment_action(self, force=False):
        if not self.payment_type_ids:
                    raise UserError("Debes definir al menos un método de pago.")
        
        total_amount_infractions = sum(self.infraction_ids.mapped("infraction_total_amount"))
        total = sum(self.payment_type_ids.mapped("amount"))
        if f"{total:.2f}" != f"{total_amount_infractions:.2f}":
            raise UserError(
                f"Total en metos de pago( ₡{total:.2f} ) es diferente al Monto de infracciones ( ₡{total_amount_infractions:.2f} )."
            )

        if not force:
            return {
                "type": "ir.actions.act_window",
                "name": "Confirmar pago múltiple",
                "res_model": self._name,
                "view_mode": "form",
                "view_id": self.env.ref("parking_meters.view_confirmation_modal").id,
                "target": "new",
                "res_id": self.id,
            }

        paid_state = self.env["parking_meters.infraction_state"].search([("description", "=", "CANCELADO")], limit=1)

        for inf in self.infraction_ids:
            if paid_state:
                inf.write({
                    "payment_date": datetime.now(),
                    "infraction_state_id": paid_state.id,
                    "cashier_user_id": self.env.user.id,
                    "cancellation_description": self.cancellation_description,
                })

        self.env["parking_meters.infraction"].insert_payment(
            ticket_number=self.infraction_ids.mapped("ticket_number"),
            email="N/A",
            identification="N/A",
            ip="N/A",
            phone="N/A",
            name="N/A",
            last_name="N/A",
            date_pay=datetime.now(),
            status_transaction_id=2,
            transaction_type=self.payment_type_ids,
        )

        return {
            "type": "ir.actions.act_window",
            "name": "Confirmación de Pago",
            "res_model": self._name,
            "view_mode": "form",
            "view_id": self.env.ref("parking_meters.view_payment_modal").id,
            "target": "new",
            "res_id": self.id,
        }

