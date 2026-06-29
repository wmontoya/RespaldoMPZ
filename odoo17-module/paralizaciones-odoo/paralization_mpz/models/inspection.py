from odoo import models, fields, api


class Inspection(models.Model):
    _name = 'paralization_mpz.inspection'
    _description = 'Acta de Inspección'
    _order = 'id desc'
    _rec_name = 'name'

    # Consecutivo del acta
    name = fields.Char(
        string='Número de Acta',
        required=True,
        copy=False,
        readonly=True,
        default='Nuevo'
    )

    # Fecha y hora
    fecha = fields.Date(
        string='Fecha',
        default=fields.Date.context_today,
        required=True
    )

    # Dirección exacta
    direccion = fields.Text(
        string='Dirección Exacta'
    )

    # Descripción de hechos
    descripcion_hechos = fields.Text(
        string='Descripción de los Hechos',
        required=True
    )

    # Inspector
    inspector_id = fields.Many2one("paralization_mpz.inspector", string="Inspector")
    inspector_cedula = fields.Char(
        related="inspector_id.cedula",
        string="Cédula Inspector",
        readonly=True,
        store=True,
    )

    # Testigo
    testigo_nombre = fields.Char(
        string='Nombre del Testigo'
    )

    testigo_cedula = fields.Char(
        string='Cédula del Testigo'
    )

    # Evidencias
    evidencia_ids = fields.One2many(
        'paralization_mpz.evidencia',
        'inspection_id',
        string='Evidencias'
    )
    
    boleta_id = fields.Many2one(
        'paralization_mpz.boleta',
        string='Boleta'
    )

    @api.model
    def create(self, vals):
        if vals.get('name', 'Nuevo') == 'Nuevo':
            vals['name'] = self.env['ir.sequence'].next_by_code(
                'paralization_mpz.inspection'
            ) or 'Nuevo'

        return super().create(vals)