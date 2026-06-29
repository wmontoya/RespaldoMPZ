from odoo import http
from odoo.http import request


def _serialize_boleta(rec):
    return {
        'id': rec.id,
        'numero_boleta': rec.numero_boleta,
        'consecutivo_digital': rec.consecutivo_digital,
        'fecha_boleta': str(rec.fecha_boleta) if rec.fecha_boleta else None,
        'inspector_nombre': rec.inspector_nombre,
        'inspector_cedula': rec.inspector_cedula,
        'administrador_nombre': rec.administrador_nombre,
        'administrador_cedula': rec.administrador_cedula,
        'obra_direccion': rec.obra_direccion,
        'obra_distrito': rec.obra_distrito,
        'area_m2': rec.area_m2,
        'metros_frente': rec.metros_frente,
        'cantidad_niveles': rec.cantidad_niveles,
        'porcentaje_avance': rec.porcentaje_avance,
        'via_acceso': rec.via_acceso,
        'unidad_medida': rec.unidad_medida,
        'unidad_medida_extra': rec.unidad_medida_extra,
        'tipo_piso_id': rec.tipo_piso_id.id if rec.tipo_piso_id else None,
        'tipo_pared_id': rec.tipo_pared_id.id if rec.tipo_pared_id else None,
        'tipo_techo_id': rec.tipo_techo_id.id if rec.tipo_techo_id else None,
        'descripcion_obra': rec.descripcion_obra,
        'observaciones': rec.observaciones,
        'afectacion_legal': rec.afectacion_legal,
        'notificado_nombre': rec.notificado_nombre,
        'notificado_cedula': rec.notificado_cedula,
        'notificado_hora': rec.notificado_hora,
        'notificado_firma': bool(rec.notificado_firma),
        'testigo_nombre': rec.testigo_nombre,
        'testigo_cedula': rec.testigo_cedula,
        'testigo_firma': bool(rec.testigo_firma),
        'acepta_firmar': rec.acepta_firmar,
        'inspector_firma': bool(rec.inspector_firma),
        'usuario_id': rec.usuario_id.id if rec.usuario_id else None,
        'evidencia_ids': [e.id for e in rec.evidencia_ids],
    }


class BoletaController(http.Controller):

    @http.route('/api/paralization_mpz/boletas', type='json', auth='user', methods=['POST'], csrf=False)
    def boleta_list(self, domain=None, limit=100, offset=0, order='id desc'):
        recs = request.env['paralization_mpz.boleta'].search(domain or [], limit=limit, offset=offset, order=order)
        return [_serialize_boleta(r) for r in recs]

    @http.route('/api/paralization_mpz/boleta/<int:record_id>', type='json', auth='user', methods=['POST'], csrf=False)
    def boleta_get(self, record_id):
        rec = request.env['paralization_mpz.boleta'].browse(record_id)
        if not rec.exists():
            return {'error': 'Registro no encontrado'}
        return _serialize_boleta(rec)

    @http.route('/api/paralization_mpz/boleta/create', type='json', auth='user', methods=['POST'], csrf=False)
    def boleta_create(self, vals):
        rec = request.env['paralization_mpz.boleta'].create(vals)
        return {'id': rec.id, 'numero_boleta': rec.numero_boleta}

    @http.route('/api/paralization_mpz/boleta/<int:record_id>/write', type='json', auth='user', methods=['POST'], csrf=False)
    def boleta_write(self, record_id, vals):
        rec = request.env['paralization_mpz.boleta'].browse(record_id)
        if not rec.exists():
            return {'error': 'Registro no encontrado'}
        rec.write(vals)
        return {'ok': True}

    @http.route('/api/paralization_mpz/boleta/<int:record_id>/unlink', type='json', auth='user', methods=['POST'], csrf=False)
    def boleta_unlink(self, record_id):
        rec = request.env['paralization_mpz.boleta'].browse(record_id)
        if not rec.exists():
            return {'error': 'Registro no encontrado'}
        rec.unlink()
        return {'ok': True}
