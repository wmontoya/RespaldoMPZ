from odoo import models, fields, api

class AgreementFile(models.Model):
    _name = 'patrimonial.agreement.file'
    _description = 'Agreement File'
    
    name = fields.Char('Nombre')
    
    attachment_id = fields.Many2many(
        'ir.attachment',
        string='Archivo',
        required=True,
        ondelete='cascade'
    )

    estado = fields.Selection([
        ('vigente', 'Vigente'),
        ('vencido', 'Vencido'),
        ('en_tramite', 'En Trámite')
    ], string='File Status', default='vigente', required=True)

    agreement_id = fields.Many2one(
        'patrimonial.agreement',
        string='Convenio'
    )
    
    agreementp_id = fields.Many2one(
        'patrimonial.property',
        string='Propiedad'
    )
    
    @api.onchange('attachment_id')
    def _onchange_attachment_id(self):
        if self.attachment_id:
            attachment = self.attachment_id[0]
            self.name = attachment.name or attachment.datas_fname
            
    @api.model
    def create(self, vals):
        if vals.get('attachment_id') and not vals.get('name'):
            attachment_id = self._get_first_attachment_id(vals['attachment_id'])

            if attachment_id:
                attachment = self.env['ir.attachment'].browse(attachment_id)
                vals['name'] = attachment.name or attachment.datas_fname

        return super().create(vals)

    def write(self, vals):
        if vals.get('attachment_id'):
            attachment_id = self._get_first_attachment_id(vals['attachment_id'])

            if attachment_id:
                attachment = self.env['ir.attachment'].browse(attachment_id)
                vals['name'] = attachment.name or attachment.datas_fname

        return super().write(vals)

    def _get_first_attachment_id(self, commands):
        """
        Extrae el primer ID válido de comandos many2many
        """
        for cmd in commands:
            if cmd[0] == 4:  # link
                return cmd[1]
            elif cmd[0] == 6 and cmd[2]:  # replace
                return cmd[2][0]
            elif cmd[0] == 0:  # create (raro pero posible)
                return False
        return False
    
    
