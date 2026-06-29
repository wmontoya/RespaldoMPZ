# from odoo import http
# from odoo.http import request


# class TestEmailController(http.Controller):
#     """Endpoint dummy para probar el envío de correos con adjunto (vía SMTP).

#     Pensado para pruebas con Postman. Llama al método genérico
#     ``notifications_mpz.oracle_email.send_email_with_attachment``.
#     """

#     @http.route(
#         "/api/v1/notifications/test_email",
#         type="json",
#         auth="user",
#         methods=["POST"],
#         csrf=False,
#     )
#     def test_email(self, **kwargs):
#         try:
#             to = (kwargs.get("to") or "").strip()
#             if not to:
#                 return {"success": False, "message": "Debe indicar 'to'"}

#             request.env["notifications_mpz.oracle_email"].sudo().send_email_with_attachment(
#                 to=to,
#                 subject=kwargs.get("subject"),
#                 name=kwargs.get("name"),
#                 attachment_name=kwargs.get("attachment_name"),
#                 attachment_content=kwargs.get("attachment_content"),
#                 body_html=kwargs.get("body_html"),
#             )

#             return {
#                 "success": True,
#                 "message": "Correo enviado correctamente.",
#             }
#         except Exception as e:
#             return {"success": False, "message": str(e)}
