from odoo import models, fields


class PatrimonialProperty(models.Model):
    _name = "patrimonial.property"
    _description = "Patrimonial Property"
    _rec_name = "expediente"

    expediente = fields.Char(string="File Number", required=True)
    tipo = fields.Selection(
        [
            ("zona_verde", "BIENES DEMANIALES"),
            ("inmueble_patrimonial", "BIENES INMUEBLES PATRIMONIALES"),
        ],
        string="Type",
        required=True,
    )

    direction = fields.Text(string="Direction")

    estate_ids = fields.One2many("patrimonial.finca", "estate_id", string="Estates")

    maintenance_ids = fields.One2many(
        "property.maintenance",
        "maintenance_id",
        string="Maintenances",
        ondelete="cascade",
    )

    agreement_ids = fields.One2many(
        "patrimonial.agreement", "property_id", string="Agreements", ondelete="cascade"
    )

    donor = fields.Text(string="Donor")

    def action_add_agreement(self):
        return {
            "type": "ir.actions.act_window",
            "res_model": "patrimonial.agreement",
            "name": "Agregar Convenio",
            "view_mode": "form",
            "view_id": self.env.ref(
                "property_patrimonial.view_patrimonial_agreement_form"
            ).id,
            "target": "new",
            "context": {"default_property_id": self.id},
        }

    file_ids = fields.One2many(
        "patrimonial.agreement.file", "agreementp_id", string="Archivos"
    )
