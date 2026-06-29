# -*- coding: utf-8 -*-
from odoo import http
from odoo.http import request
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.pdfgen import canvas
from reportlab.pdfbase.pdfmetrics import stringWidth, registerFont
from reportlab.pdfbase.ttfonts import TTFont
from io import BytesIO
import os

# ── Registro de fuentes UTF-8 ─────────────────────────────────────────────────
_FONT_CANDIDATES = [
    ('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
     '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'),
    ('C:\\Windows\\Fonts\\arial.ttf',
     'C:\\Windows\\Fonts\\arialbd.ttf'),
]

BF  = 'Helvetica'
BFB = 'Helvetica-Bold'

for _reg, _bold in _FONT_CANDIDATES:
    if os.path.exists(_reg) and os.path.exists(_bold):
        try:
            registerFont(TTFont('CR', _reg))
            registerFont(TTFont('CB', _bold))
            BF  = 'CR'
            BFB = 'CB'
        except Exception:
            pass
        break


class BoletaController(http.Controller):

    @http.route('/reporte/boleta/<int:boleta_id>', type='http', auth='user')
    def generar_reporte_boleta(self, boleta_id, **kw):

        # ── helpers ───────────────────────────────────────────────────────────
        def _s(v):
            return (v or '').strip() if v else ''

        def _n(v):
            if v is None:
                return ''
            if isinstance(v, float):
                return str(int(v)) if v.is_integer() else ('%.2f' % v).rstrip('0').rstrip('.')
            return str(v)

        def sw(txt, font, sz):
            try:
                return stringWidth(txt, font, sz)
            except Exception:
                return len(txt) * sz * 0.55

        def inline_field(x, y, value, line_w=80, fs=8.2):
            """Dibuja una línea subrayada con value encima. Sin rayas si no hay valor.
            Retorna el x final de la línea."""
            x1 = x + line_w
            # Solo dibuja la línea si hay valor
            if value:
                # Dibujar el texto del valor
                pdf.setFont(BF, fs)
                pdf.setFillColor(BLUE)
                avail = x1 - x - 2
                v = value
                while v and sw(v, BF, fs) > avail:
                    v = v[:-1]
                if v != value:
                    v = v[:-1] + '\u2026'
                pdf.drawString(x + 1, y, v)
            return x1

        def plain(t, x, y, fs=8.2, bold=False):
            f = BFB if bold else BF
            pdf.setFont(f, fs)
            pdf.setFillColor(BLUE)
            pdf.drawString(x, y, t)
            return x + sw(t, f, fs)

        def wrap_text(text, x, y, max_w, fs=8.2, bold=False, lh=11):
            """Dibuja texto con word-wrap. Retorna y final (después de la última línea)."""
            f = BFB if bold else BF
            pdf.setFont(f, fs)
            pdf.setFillColor(BLUE)
            words = text.split()
            line = ''
            cy = y
            for w in words:
                test = (line + ' ' + w).strip()
                if sw(test, f, fs) <= max_w:
                    line = test
                else:
                    if line:
                        pdf.drawString(x, cy, line)
                        cy -= lh
                    line = w
            if line:
                pdf.drawString(x, cy, line)
                cy -= lh
            return cy

        def wrap_inline(x_start, y, remaining_text, value, line_w, max_x, fs=8.2, lh=11):
            """
            Dibuja 'remaining_text' inline desde x_start. Si el texto + campo no caben,
            baja de línea. Retorna (x_final, y_final).
            """
            f = BF
            pdf.setFont(f, fs)
            pdf.setFillColor(BLUE)

            words = remaining_text.split()
            line_buf = ''
            x = x_start
            cy = y

            for w in words:
                test = (line_buf + ' ' + w).strip()
                if x + sw(test, f, fs) <= max_x:
                    line_buf = test
                else:
                    if line_buf:
                        pdf.drawString(x, cy, line_buf)
                        x = ML
                        cy -= lh
                        line_buf = w
                    else:
                        line_buf = w

            if line_buf:
                pdf.drawString(x, cy, line_buf)
                x += sw(line_buf, f, fs) + 2

            # Ahora dibuja el campo
            x_field_end = x + line_w
            if x_field_end > max_x:
                x = ML
                cy -= lh
                x_field_end = x + line_w

            x = inline_field(x, cy, value, line_w=line_w, fs=fs)
            return x, cy

        # ── datos del modelo ──────────────────────────────────────────────────
        boleta = request.env['paralization_mpz.boleta'].browse(boleta_id)
        if not boleta.exists():
            return request.not_found()

        num_boleta          = _s(boleta.numero_boleta)
        consecutivo_digital = _s(boleta.consecutivo_digital)
        fecha               = boleta.fecha_boleta
        dia                 = fecha.strftime('%d') if fecha else '__'
        mes                 = fecha.strftime('%m') if fecha else '__'
        anio                = str(fecha.year)[-2:] if fecha else '__'

        inspector           = _s(boleta.inspector_id.name if boleta.inspector_id else '')
        insp_ced            = _s(boleta.inspector_cedula)
        adm_nombre          = _s(boleta.administrador_nombre)
        adm_cedula          = _s(boleta.administrador_cedula)
        direccion           = _s(boleta.obra_direccion)
        distrito            = _s(boleta.obra_distrito_id.name if boleta.obra_distrito_id else '')
        pared               = _s(boleta.tipo_pared_id.desc_pared if boleta.tipo_pared_id else '')
        piso                = _s(boleta.tipo_piso_id.desc_piso   if boleta.tipo_piso_id  else '')
        techo               = _s(boleta.tipo_techo_id.desc_techo if boleta.tipo_techo_id else '')
        frente              = _n(boleta.metros_frente)
        niveles             = _n(boleta.cantidad_niveles)
        area_m2             = _n(boleta.area_m2)
        avance              = _n(boleta.porcentaje_avance)
        unidad_map          = dict(boleta._fields['unidad_medida'].selection or [])
        unidad_txt          = unidad_map.get(boleta.unidad_medida, 'm2')
        via_map             = dict(boleta._fields['via_acceso'].selection or [])
        via                 = via_map.get(boleta.via_acceso, '')
        afectacion          = _s(boleta.afectacion_legal)
        descripcion         = _s(boleta.descripcion_obra)
        observ              = _s(boleta.observaciones)
        hora                = _s(boleta.notificado_hora)
        notif_n             = _s(boleta.notificado_nombre)
        notif_c             = _s(boleta.notificado_cedula)
        testigo_n           = _s(boleta.testigo_nombre)
        testigo_c           = _s(boleta.testigo_cedula)
        acepta_firmar       = bool(boleta.acepta_firmar)

        # ── canvas ────────────────────────────────────────────────────────────
        buf = BytesIO()
        pdf = canvas.Canvas(buf, pagesize=letter)
        PW, PH = letter   # 612 x 792

        BLUE      = colors.HexColor('#2E4E8F')
        DARK_BLUE = colors.HexColor('#1A3A6B')
        RED       = colors.HexColor('#C0392B')
        BLACK     = colors.HexColor('#000000')

        ML  = 32   # margen izquierdo
        MR  = 28   # margen derecho
        CW  = PW - ML - MR   # ~552 pts ancho útil
        MAX_X = PW - MR       # límite derecho absoluto

        fs  = 8.2
        lh  = 11.5

        # ═════════════════════════════════════════════════════════════════════
        #  ENCABEZADO
        # ═════════════════════════════════════════════════════════════════════
        y = PH - 16

        # ── Escudo (círculo con texto) ──
        esc_cx = ML + 28
        esc_cy = y - 30
        pdf.setStrokeColor(BLUE)
        pdf.setFillColor(colors.white)
        pdf.setLineWidth(1)
        pdf.circle(esc_cx, esc_cy, 27, stroke=1, fill=1)
        pdf.setFillColor(BLUE)
        for i, t in enumerate(['MUNICIPALIDAD', 'DE PEREZ', 'ZELEDON']):
            pdf.setFont(BFB, 5)
            pdf.drawCentredString(esc_cx, esc_cy + 9 - i * 7, t)

        # ── Bloque central de texto ──
        cx = PW / 2
        pdf.setFillColor(DARK_BLUE)
        pdf.setFont(BFB, 13)
        pdf.drawCentredString(cx, y - 8, 'MUNICIPALIDAD DE P\u00c9REZ ZELED\u00d3N')
        pdf.setFont(BF, 7)
        pdf.setFillColor(BLUE)
        pdf.drawCentredString(cx, y - 18, 'C\u00e9dula Jur\u00eddica N\u00ba 3-014-042056')
        pdf.setFont(BFB, 7)
        pdf.drawCentredString(cx, y - 27, 'Proceso de Planificaci\u00f3n Territorial en Oficina Control Constructivo')
        pdf.setFont(BF, 7)
        pdf.drawCentredString(cx, y - 36, 'Tel\u00e9fono: 2220-6600  \u2022  Fax: 2771-2105')
        pdf.drawCentredString(cx, y - 44, 'Correo electr\u00f3nico: planificacionterritorial@mpz.go.cr  \u2022  Apartado Postal: 274-8000')

        # ── Recuadro N° (esquina superior derecha) ──
        BOX_W = 110
        BOX_H = 26
        box_x = PW - MR - BOX_W
        box_y = y
        pdf.setStrokeColor(BLUE)
        pdf.setLineWidth(1)
        pdf.roundRect(box_x, box_y - BOX_H, BOX_W, BOX_H, 4, stroke=1, fill=0)
        pdf.setFont(BFB, 11)
        pdf.setFillColor(BLUE)
        pdf.drawString(box_x + 8, box_y - BOX_H + 8, 'N\u00ba')
        pdf.setFont(BFB, 16)
        pdf.drawString(box_x + 30, box_y - BOX_H + 6, num_boleta)

        # ── "Paralizacion de Obras / Consecutivo Digital" ──
        txt_x = box_x
        pdf.setFont(BF, 7)
        pdf.setFillColor(BLUE)
        pdf.drawString(txt_x, box_y - BOX_H - 10, 'Paralizaci\u00f3n de Obras')
        pdf.drawString(txt_x, box_y - BOX_H - 19, 'Consecutivo Digital')
        pdf.setFont(BFB, 18)
        pdf.drawString(txt_x, box_y - BOX_H - 37, consecutivo_digital)

        # ── Título principal ──
        y = PH - 72
        pdf.setFillColor(DARK_BLUE)
        pdf.setFont(BFB, 13)
        pdf.drawCentredString(cx, y, 'BOLETA PARALIZACI\u00d3N DE OBRA')

        y -= 6
        pdf.setStrokeColor(BLUE)
        pdf.setLineWidth(0.8)
        pdf.line(ML, y, PW - MR, y)
        y -= 2

        # ═════════════════════════════════════════════════════════════════════
        #  PÁRRAFO PRINCIPAL
        # ═════════════════════════════════════════════════════════════════════

        intro = (
            'El o la suscrito (a) en mi calidad de funcionario (a) municipal Inspector (a) de Control '
            'Constructivo de la Municipalidad de P\u00e9rez Zeled\u00f3n, en atenci\u00f3n a las funciones propias de mi cargo '
            'y bajo las potestades conferidas con base en la Ley General de Administraci\u00f3n P\u00fablica N\u00ba 6227, '
            'Ley de Construcciones N\u00ba 833, C\u00f3digo Municipal N\u00ba 7794, Constituci\u00f3n Pol\u00edtica, Ley de Planificaci\u00f3n '
            'Urbana N\u00ba 4240 y dem\u00e1s normas conexas procedo a notificar en fecha:'
        )
        y -= 4
        y = wrap_text(intro, ML, y, CW, fs=fs, lh=lh)

        # ── Línea: fecha inline con texto continuado ──
        # "DD / MM / AA , a quien se identifica como propietario de la finca ubicada en:"
        y -= 1
        x = ML
        # fecha
        x = inline_field(x, y, dia,  line_w=18, fs=fs); x += 2
        x = plain(' / ', x, y, fs=fs)
        x = inline_field(x, y, mes,  line_w=18, fs=fs); x += 2
        x = plain(' / ', x, y, fs=fs)
        x = inline_field(x, y, anio, line_w=18, fs=fs); x += 2
        resto_linea1 = ', a quien se identifica como propietario de la finca ubicada en:'
        x = plain(resto_linea1, x, y, fs=fs)

        # ── Dirección: puede ser muy larga, va en la siguiente línea completa ──
        y -= lh
        # Dibujar dirección con wrap en ancho completo
        y = wrap_text(direccion, ML, y, CW, fs=fs, lh=lh)

        # ── Distrito ──
        # Quedamos en la y actual después del wrap de dirección
        # Escribir ", del distrito de: VALOR"
        y -= 1
        x = ML
        txt_dist = ', del distrito de: '
        x = plain(txt_dist, x, y, fs=fs)
        x = inline_field(x, y, distrito, line_w=min(160, MAX_X - x - 4), fs=fs)

        # ── Administrado infractor ──
        y -= lh
        x = ML
        x = plain('Administrado infractor: ', x, y, fs=fs)
        x = inline_field(x, y, adm_nombre, line_w=min(200, MAX_X - x - 4), fs=fs)

        y -= lh
        x = ML
        x = plain('n\u00famero de identificaci\u00f3n: ', x, y, fs=fs)
        x = inline_field(x, y, adm_cedula, line_w=100, fs=fs)
        rest1 = (', el cual con pleno conocimiento, est\u00e1 infringiendo el Art\u00edculo 89 de la Ley de '
                 'Construcciones N\u00ba 833, al estar desarrollando en su inmueble las obras que obedece a:')
        # wrap del texto restante en la misma línea y siguientes
        # Si cabe en la línea actual, lo ponemos; si no, bajamos
        if x + sw(rest1, BF, fs) <= MAX_X:
            plain(rest1, x, y, fs=fs)
            y -= lh
        else:
            # Poner lo que cabe y bajar
            words_r = rest1.split()
            line_b = ''
            cx2 = x
            for w in words_r:
                test = (line_b + ' ' + w).strip()
                if cx2 + sw(test, BF, fs) <= MAX_X:
                    line_b = test
                else:
                    if line_b:
                        plain(line_b, cx2, y, fs=fs)
                        y -= lh
                        cx2 = ML
                        line_b = w
                    else:
                        line_b = w
            if line_b:
                plain(line_b, cx2, y, fs=fs)
                y -= lh

        # ── Afectación + área ──
        x = ML
        x = inline_field(x, y, afectacion, line_w=130, fs=fs)
        x = plain(', lo anterior por un \u00e1rea de: ', x, y, fs=fs)
        x = inline_field(x, y, area_m2, line_w=30, fs=fs)
        x = plain(' metros ', x, y, fs=fs)
        x = inline_field(x, y, unidad_txt, line_w=22, fs=fs)
        rest2 = ', misma que consta de las siguientes caracter\u00edsticas, en sus tipos de materiales:'
        if x + sw(rest2, BF, fs) <= MAX_X:
            plain(rest2, x, y, fs=fs)
            y -= lh
        else:
            y = wrap_text(rest2, x, y, MAX_X - x, fs=fs, lh=lh)

        # ── Materiales ──
        x = ML
        x = plain('Paredes: ', x, y, fs=fs)
        x = inline_field(x, y, pared, line_w=55, fs=fs)
        x = plain(', Pisos: ', x, y, fs=fs)
        x = inline_field(x, y, piso, line_w=55, fs=fs)
        x = plain(', Techos: ', x, y, fs=fs)
        x = inline_field(x, y, techo, line_w=55, fs=fs)
        x = plain(', metros de frente: ', x, y, fs=fs)
        x = inline_field(x, y, frente, line_w=25, fs=fs)

        y -= lh
        x = ML
        x = plain('cantidad de niveles de la obra: ', x, y, fs=fs)
        x = inline_field(x, y, niveles, line_w=22, fs=fs)
        x = plain(', con un avance en la visita de: ', x, y, fs=fs)
        x = inline_field(x, y, avance, line_w=25, fs=fs)
        x = plain('%, misma que se ubica en una v\u00eda de acceso mediante: ', x, y, fs=fs)
        x = inline_field(x, y, via, line_w=min(40, MAX_X - x - 2), fs=fs)

        # ── Segunda descripción ──
        y -= lh
        x = ML
        x = plain('y a su vez: ', x, y, fs=fs)
        x = inline_field(x, y, descripcion, line_w=150, fs=fs)
        txt_forestal = ', est\u00e1 afectada por la Ley Forestal N\u00ba 7575.'
        if x + sw(txt_forestal, BF, fs) <= MAX_X:
            plain(txt_forestal, x, y, fs=fs)
            y -= lh
        else:
            plain(txt_forestal, ML, y - lh, fs=fs)
            y -= lh * 2

        # ── Observaciones ──
        x = ML
        x = plain('Observaciones en Obra: ', x, y, fs=fs)
        # Wrap de observaciones
        if observ:
            avail_obs = MAX_X - x - 2
            if sw(observ, BF, fs) <= avail_obs:
                plain(observ, x, y, fs=fs)
                y -= lh
            else:
                # primera línea desde x, resto desde ML
                words_o = observ.split()
                line_o = ''
                cx_o = x
                primera = True
                for w in words_o:
                    avail = MAX_X - cx_o - 2
                    test = (line_o + ' ' + w).strip()
                    if sw(test, BF, fs) <= avail:
                        line_o = test
                    else:
                        if line_o:
                            plain(line_o, cx_o, y, fs=fs)
                            y -= lh
                            cx_o = ML
                            line_o = w
                            primera = False
                        else:
                            line_o = w
                if line_o:
                    plain(line_o, cx_o, y, fs=fs)
                    y -= lh
        else:
            y -= lh

        # Segunda línea de observaciones vacía
        y -= lh

        # ═════════════════════════════════════════════════════════════════════
        #  CUADRO DE ADVERTENCIA
        # ═════════════════════════════════════════════════════════════════════
        y -= 4
        aviso = (
            'As\u00ed tambi\u00e9n se le ordena que debe suspender inmediatamente la ejecuci\u00f3n de las obras hasta que '
            'cuente con la respectiva Licencia Municipal que le acredite a continuar con las obras, bajo el '
            'apercibimiento de que en casos de continuar con el acto infractor se le podr\u00e1 seguir causa judicial '
            'por el delito de desobediencia a la autoridad, previsto y sancionado en el art\u00edculo 314 de '
            'C\u00f3digo Penal N\u00ba 4573, as\u00ed como las dem\u00e1s sanciones administrativas que se crea convenientes.'
        )
        pad     = 5
        box_fs  = 8.2
        f_tmp   = BFB
        words   = aviso.split()
        aviso_w = CW - pad * 2 - 4
        line    = ''
        lines   = []
        for w in words:
            test = (line + ' ' + w).strip()
            if sw(test, f_tmp, box_fs) <= aviso_w:
                line = test
            else:
                if line:
                    lines.append(line)
                line = w
        if line:
            lines.append(line)
        box_inner_h = len(lines) * 10 + pad * 2
        box_y_top   = y
        box_y_bot   = y - box_inner_h

        pdf.setStrokeColor(BLUE)
        pdf.setFillColor(colors.white)
        pdf.setLineWidth(1)
        pdf.roundRect(ML, box_y_bot, CW, box_inner_h, 4, stroke=1, fill=1)

        pdf.setFont(BFB, box_fs)
        pdf.setFillColor(BLUE)
        ty = box_y_top - pad - 9
        for ln in lines:
            pdf.drawString(ML + pad + 2, ty, ln)
            ty -= 10

        y = box_y_bot - 8

        # ═════════════════════════════════════════════════════════════════════
        #  CONSTANCIA DE NOTIFICACIÓN
        # ═════════════════════════════════════════════════════════════════════
        pdf.setFont(BFB, 10)
        pdf.setFillColor(DARK_BLUE)
        pdf.drawCentredString(cx, y, 'CONSTANCIA DE NOTIFICACI\u00d3N')
        y -= 4
        pdf.setStrokeColor(BLUE)
        pdf.setLineWidth(0.6)
        titulo_w = sw('CONSTANCIA DE NOTIFICACI\u00d3N', BFB, 10)
        pdf.line(cx - titulo_w / 2, y, cx + titulo_w / 2, y)

        # ── Párrafo notificación ──
        y -= lh
        x = ML
        x = plain('El suscrito ', x, y, fs=fs)
        x = inline_field(x, y, inspector, line_w=min(170, MAX_X - x - 80), fs=fs)
        x = plain(', en mi calidad de inspector municipal,', x, y, fs=fs)

        y -= lh
        x = ML
        x = plain('he procedido al ser las ', x, y, fs=fs)
        x = inline_field(x, y, hora, line_w=38, fs=fs)
        x = plain(' horas, del d\u00eda ', x, y, fs=fs)
        x = inline_field(x, y, dia, line_w=20, fs=fs)
        x = plain(' de ', x, y, fs=fs)
        x = inline_field(x, y, mes, line_w=20, fs=fs)
        x = plain(' del a\u00f1o ', x, y, fs=fs)
        x = inline_field(x, y, anio, line_w=20, fs=fs)
        x = plain(', a notificar personalmente al', x, y, fs=fs)

        y -= lh
        x = ML
        x = plain('se\u00f1or: ', x, y, fs=fs)
        x = inline_field(x, y, notif_n, line_w=min(200, MAX_X - x - 80), fs=fs)
        x = plain(', con n\u00famero de', x, y, fs=fs)

        y -= lh
        x = ML
        x = plain('identificaci\u00f3n: ', x, y, fs=fs)
        x = inline_field(x, y, notif_c, line_w=100, fs=fs)
        rest_notif = ', los hechos ac\u00e1 descritos, quien a su vez con pleno conocimiento del acto efectuado y la orden emitida:'
        if x + sw(rest_notif, BF, fs) <= MAX_X:
            plain(rest_notif, x, y, fs=fs)
            y -= lh
        else:
            y = wrap_text(rest_notif, x, y, MAX_X - x, fs=fs, lh=lh)

        # ── Checkboxes ──
        y -= 2
        x = ML
        pdf.setFont(BF, 9)
        pdf.setFillColor(BLUE)
        check_acepta   = '(\u2713)' if acepta_firmar else '( )'
        check_abstiene = '( )'    if acepta_firmar else '(\u2713)'
        pdf.drawString(x, y, check_acepta + ' Acepta firmar el documento entregado')
        pdf.drawString(x + 240, y, check_abstiene + ' Se abstiene de firmar el documento mismo que se entrega.')

        # ── Párrafo validez ──
        y -= lh + 2
        validez = (
            'Situaci\u00f3n que se le enfatiza que aun con su recibido o no del mismo, el acto es v\u00e1lido y deber\u00e1 '
            'proceder a acatar las disposiciones emitidas y a proceder a ponerse a derecho conforme a la '
            'Ley de Construcciones N\u00ba 833.'
        )
        y = wrap_text(validez, ML, y, CW, fs=fs, lh=lh)

        # ═════════════════════════════════════════════════════════════════════
        #  FIRMAS
        # ═════════════════════════════════════════════════════════════════════
        y -= 6

        # ── Firma del Inspector ──
        x = ML
        txt_firma = 'Firma del Inspector que notifica: '
        x = plain(txt_firma, x, y, fs=fs)
        # línea de firma
        firma_line_x0 = x
        firma_line_x1 = x + 140
        pdf.setStrokeColor(BLUE)
        pdf.setLineWidth(0.5)
        pdf.line(firma_line_x0, y - 2, firma_line_x1, y - 2)
        x = firma_line_x1 + 6
        x = plain('C\u00e9dula de identidad: ', x, y, fs=fs)
        inline_field(x, y, insp_ced, line_w=MAX_X - x - 2, fs=fs)

        # ── Testigo del acto ──
        y -= lh + 4
        plain('Testigo del acto:', ML, y, fs=fs, bold=True)

        y -= lh
        x = ML
        x = plain('Nombre: ', x, y, fs=fs)
        inline_field(x, y, testigo_n, line_w=MAX_X - x - 4, fs=fs)

        y -= lh
        x = ML
        x = plain('C\u00e9dula de identidad N\u00ba ', x, y, fs=fs)
        x = inline_field(x, y, testigo_c, line_w=120, fs=fs)
        x = plain('  Firma: ', x, y, fs=fs)
        # Línea de firma
        pdf.setStrokeColor(BLUE)
        pdf.setLineWidth(0.5)
        pdf.line(x, y - 2, MAX_X, y - 2)

        # ── Notificado ──
        y -= lh + 4
        plain('Datos del notificado que recibe el documento:', ML, y, fs=fs, bold=True)

        y -= lh
        x = ML
        x = plain('Nombre: ', x, y, fs=fs)
        inline_field(x, y, notif_n, line_w=MAX_X - x - 4, fs=fs)

        y -= lh
        x = ML
        x = plain('C\u00e9dula de identidad N\u00ba ', x, y, fs=fs)
        x = inline_field(x, y, notif_c, line_w=120, fs=fs)
        x = plain('  Firma: ', x, y, fs=fs)
        pdf.setStrokeColor(BLUE)
        pdf.setLineWidth(0.5)
        pdf.line(x, y - 2, MAX_X, y - 2)

        # ═════════════════════════════════════════════════════════════════════
        #  PIE DE PÁGINA
        # ═════════════════════════════════════════════════════════════════════
        footer_y = 18
        pdf.setFont(BF, 6)
        pdf.setFillColor(colors.HexColor('#888888'))
        footer_txt = 'IMPRESOS URGENTES TEL: 2772-2529  OT 059365Q-280  24/50/3  N\u00ba 6601-7800  09.07.25'
        pdf.drawRightString(PW - MR, footer_y, footer_txt)

        pdf.setStrokeColor(colors.HexColor('#CCCCCC'))
        pdf.setLineWidth(0.4)
        pdf.line(ML, footer_y + 8, PW - MR, footer_y + 8)

        # ── Guardar ──
        pdf.save()
        buf.seek(0)

        filename = f'boleta_{num_boleta}.pdf'
        return request.make_response(
            buf.read(),
            headers=[
                ('Content-Type',        'application/pdf'),
                ('Content-Disposition', f'inline; filename="{filename}"'),
            ]
        )