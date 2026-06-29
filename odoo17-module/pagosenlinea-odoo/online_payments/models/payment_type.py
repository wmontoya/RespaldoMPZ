from odoo import models, api

class PaymentType(models.TransientModel):
    _name = "online_payments.payment_type"
    _description = "Payment Type"

    @api.model
    def execute_handler(self, prefix, payment):
        method_name = f"_process_{prefix.lower()}_payment"
        if hasattr(self, method_name):
            return getattr(self, method_name)(payment)
        else:
            self.env["ir.logging"].sudo().create({
                "name": "payment_type_handler",
                "type": "server",
                "dbname": self.env.cr.dbname,
                "level": "Warning",
                "message": f"No existe un método handler para el prefijo: {prefix}",
                "path": __name__,
                "func": "execute_handler",
                "line": 42,
            })
            return None

    def _process_bol_payment(self, payment):
        parking_time = (
            self.env["parking_meters.parking_time"]
            .sudo()
            .search([("id", "=", payment.payment_details_ids[0].item_id)], limit=1)
        )
        if parking_time:
            parking_time.write({"status": "active"})

    def _process_mip_payment(self, payment):
        infraction = (
            self.env["parking_meters.infraction"]
            .sudo()
            .search([("id", "=", payment.payment_details_ids[0].item_id)], limit=1)
        )
        if infraction:
            infraction.write({"infraction_state_id": 2})

    def _process_spo_payment(self, payment):
        """ Ejemplo de nuevo prefijo SPO """
        # Aquí agregas tu lógica
        pass
