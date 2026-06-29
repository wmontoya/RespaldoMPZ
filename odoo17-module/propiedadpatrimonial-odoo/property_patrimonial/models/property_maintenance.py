from odoo import models, fields


class PropertyMaintenance(models.Model):
    _name = "property.maintenance"
    _description = "Property Maintenance"
    _rec_name = "fecha"

    fecha = fields.Date(string="Date", required=True, default=fields.Date.today)

    tipo_mantenimiento = fields.Selection(
        [
            ("preventivo", "Preventivo"),
            ("correctivo", "Correctivo"),
        ],
        string="Maintenance Type",
        required=True,
    )

    observaciones = fields.Text(string="Observations")

    usuario_id = fields.Many2one(
        "res.users",
        string="Registered by",
        default=lambda self: self.env.user,
        readonly=True,
    )

    responsible_user_ids = fields.Many2many(
        "res.users",
        string="Responsible Users",
    )

    estado = fields.Selection(
        [
            ("pendiente", "Pendiente"),
            ("completado", "Completado"),
        ],
        string="State",
        default="pendiente",
    )
    
    maintenance_id = fields.Many2one("patrimonial.property", string="Property")
    
    

