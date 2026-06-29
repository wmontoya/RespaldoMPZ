from odoo import http
from odoo.http import request


def _serialize_catalog(rec, desc_field):
    return {
        'id': rec.id,
        'name': rec.name,
        desc_field: rec[desc_field],
    }


class TipoParedController(http.Controller):

    @http.route('/api/paralization_mpz/tipos/pared', type='json', auth='user', methods=['POST'], csrf=False)
    def pared_list(self, domain=None, limit=200, offset=0, order='sequence,name'):
        recs = request.env['tipos.pared'].search(domain or [], limit=limit, offset=offset, order=order)
        return [_serialize_catalog(r, 'desc_pared') for r in recs]

    @http.route('/api/paralization_mpz/tipos/pared/create', type='json', auth='user', methods=['POST'], csrf=False)
    def pared_create(self, vals):
        rec = request.env['tipos.pared'].create(vals)
        return {'id': rec.id}

    @http.route('/api/paralization_mpz/tipos/pared/<int:record_id>/write', type='json', auth='user', methods=['POST'], csrf=False)
    def pared_write(self, record_id, vals):
        rec = request.env['tipos.pared'].browse(record_id)
        if not rec.exists():
            return {'error': 'Registro no encontrado'}
        rec.write(vals)
        return {'ok': True}

    @http.route('/api/paralization_mpz/tipos/pared/<int:record_id>/unlink', type='json', auth='user', methods=['POST'], csrf=False)
    def pared_unlink(self, record_id):
        rec = request.env['tipos.pared'].browse(record_id)
        if not rec.exists():
            return {'error': 'Registro no encontrado'}
        rec.unlink()
        return {'ok': True}
