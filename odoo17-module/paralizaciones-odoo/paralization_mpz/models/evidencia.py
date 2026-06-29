from odoo import models, fields, api


class Evidencia(models.Model):
    _name = "paralization_mpz.evidencia"
    _description = "Evidencias asociadas a Boletas"
    _rec_name = "name"
    name = fields.Char("Nombre", required=True)
    boleta_id = fields.Many2one(
        "paralization_mpz.boleta", string="Boleta", ondelete="cascade"
    )
    attachment_id = fields.Many2many(
        "ir.attachment", string="Archivo", required=True, ondelete="cascade"
    )
    inspection_id = fields.Many2one("paralization_mpz.inspection", string="Inspección")
    tipo = fields.Selection(
        [("imagen", "Imagen"), ("documento", "Documento")], string="Tipo de Evidencia"
    )
    descripcion = fields.Text("Descripción")

    @api.model
    def create(self, vals):
        # If we're coming from boleta form context, set boleta_id
        if self._context.get('default_boleta_id') and not vals.get('boleta_id'):
            vals['boleta_id'] = self._context.get('default_boleta_id')
        # If we're coming from inspection form context, set inspection_id (but not boleta_id)
        elif self._context.get('default_inspection_id') and not vals.get('inspection_id'):
            vals['inspection_id'] = self._context.get('default_inspection_id')
        
        return super().create(vals)
