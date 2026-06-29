from odoo import http
from odoo.http import request


def _serialize_evidencia(rec):
    return {
        'id': rec.id,
        'boleta_id': rec.boleta_id.id if rec.boleta_id else None,
        'descripcion': rec.descripcion,
        'archivo': bool(rec.archivo),
        'tipo': rec.tipo,
    }


class EvidenciaController(http.Controller):

    @http.route('/api/paralization_mpz/evidencias', type='json', auth='user', methods=['POST'], csrf=False)
    def evidencia_list(self, domain=None, limit=200, offset=0, order='id desc'):
        recs = request.env['paralization_mpz.evidencia'].search(domain or [], limit=limit, offset=offset, order=order)
        return [_serialize_evidencia(r) for r in recs]

    @http.route('/api/paralization_mpz/evidencia/<int:record_id>', type='json', auth='user', methods=['POST'], csrf=False)
    def evidencia_get(self, record_id):
        rec = request.env['paralization_mpz.evidencia'].browse(record_id)
        if not rec.exists():
            return {'error': 'Registro no encontrado'}
        return _serialize_evidencia(rec)

    @http.route('/api/paralization_mpz/evidencia/create', type='json', auth='user', methods=['POST'], csrf=False)
    def evidencia_create(self, vals):
        rec = request.env['paralization_mpz.evidencia'].create(vals)
        return {'id': rec.id}

    @http.route('/api/paralization_mpz/evidencia/<int:record_id>/write', type='json', auth='user', methods=['POST'], csrf=False)
    def evidencia_write(self, record_id, vals):
        rec = request.env['paralization_mpz.evidencia'].browse(record_id)
        if not rec.exists():
            return {'error': 'Registro no encontrado'}
        rec.write(vals)
        return {'ok': True}

    @http.route('/api/paralization_mpz/evidencia/<int:record_id>/unlink', type='json', auth='user', methods=['POST'], csrf=False)
    def evidencia_unlink(self, record_id):
        rec = request.env['paralization_mpz.evidencia'].browse(record_id)
        if not rec.exists():
            return {'error': 'Registro no encontrado'}
        rec.unlink()
        return {'ok': True}
