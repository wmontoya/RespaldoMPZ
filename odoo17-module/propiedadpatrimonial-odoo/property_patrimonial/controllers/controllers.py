# from odoo import http


# class PropertyPatrimonial(http.Controller):
#     @http.route('/property_patrimonial/property_patrimonial', auth='public')
#     def index(self, **kw):
#         return "Hello, world"

#     @http.route('/property_patrimonial/property_patrimonial/objects', auth='public')
#     def list(self, **kw):
#         return http.request.render('property_patrimonial.listing', {
#             'root': '/property_patrimonial/property_patrimonial',
#             'objects': http.request.env['property_patrimonial.property_patrimonial'].search([]),
#         })

#     @http.route('/property_patrimonial/property_patrimonial/objects/<model("property_patrimonial.property_patrimonial"):obj>', auth='public')
#     def object(self, obj, **kw):
#         return http.request.render('property_patrimonial.object', {
#             'object': obj
#         })

