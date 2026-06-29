from odoo import http
from odoo.http import request

class AlumnoController(http.Controller):
    
    @http.route(['/alumno'], type='http', auth='public')
    def alumno_page(self):
        """
        Renders the oxp demo page
        """
        return http.request.render('alumnos.page')