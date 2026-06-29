from odoo import http
from odoo.http import request


def _serialize_catalog(rec, desc_field):
    return {
        'id': rec.id,
        'name': rec.name,
        desc_field: rec[desc_field],
    }


class TipoPisoController(http.Controller):

    @http.route('/api/paralization_mpz/tipos/piso', type='json', auth='user', methods=['POST'], csrf=False)
    def piso_list(self, domain=None, limit=200, offset=0, order='sequence,name'):
        recs = request.env['tipos.piso'].search(domain or [], limit=limit, offset=offset, order=order)
        return [_serialize_catalog(r, 'desc_piso') for r in recs]

    @http.route('/api/paralization_mpz/tipos/piso/create', type='json', auth='user', methods=['POST'], csrf=False)
    def piso_create(self, vals):
        rec = request.env['tipos.piso'].create(vals)
        return {'id': rec.id}

    @http.route('/api/paralization_mpz/tipos/piso/<int:record_id>/write', type='json', auth='user', methods=['POST'], csrf=False)
    def piso_write(self, record_id, vals):
        rec = request.env['tipos.piso'].browse(record_id)
        if not rec.exists():
            return {'error': 'Registro no encontrado'}
        rec.write(vals)
        return {'ok': True}

    @http.route('/api/paralization_mpz/tipos/piso/<int:record_id>/unlink', type='json', auth='user', methods=['POST'], csrf=False)
    def piso_unlink(self, record_id):
        rec = request.env['tipos.piso'].browse(record_id)
        if not rec.exists():
            return {'error': 'Registro no encontrado'}
        rec.unlink()
        return {'ok': True}
