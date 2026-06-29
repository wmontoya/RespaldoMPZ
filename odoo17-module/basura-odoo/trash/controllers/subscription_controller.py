from odoo import http
from odoo.http import request

class SubscriptionController(http.Controller):

    @http.route(
        '/api/v1/trash/subscribe',
        type='json',
        auth='public',
        methods=['POST'],
        csrf=False
    )
    def create_subscription(self, **kwargs):
        try:
            subscription_code = kwargs.get("subscription_code")
            route_day_ids = kwargs.get("route_day_ids", [])
            subscription_id = kwargs.get("subscription_id")

            # ✅ Validaciones básicas
            if not subscription_code:
                return {
                    "success": False,
                    "error": "subscription_code is required"
                }

            if not isinstance(route_day_ids, list):
                return {
                    "success": False,
                    "error": "route_day_ids must be a list"
                }

            route_day_ids = [int(i) for i in route_day_ids]

            RouteDay = request.env['trash.route_day'].sudo()
            Subscription = request.env['trash.route_subscription'].sudo()

            # ✅ Validar route_day_ids
            if route_day_ids:
                valid_days = RouteDay.browse(route_day_ids)
                if len(valid_days) != len(route_day_ids):
                    return {
                        "success": False,
                        "error": "Some route_day_ids do not exist"
                    }

            # ✅ CREAR
            if not subscription_id:
                subscription = Subscription.create({
                    "subscription_code": subscription_code
                })

                if route_day_ids:
                    valid_days.write({
                        "subscription_ids": [(4, subscription.id)]
                    })

                return {
                    "success": True,
                    "action": "insert",
                    "subscription_id": subscription.id
                }

            # ✅ BUSCAR EXISTENTE
            subscription = Subscription.search([
                ('id', '=', subscription_id),
                ('subscription_code', '=', subscription_code)
            ], limit=1)

            if not subscription:
                return {
                    "success": False,
                    "error": "Subscription not found"
                }

            # ✅ ELIMINAR
            if not route_day_ids:
                subscription.unlink()
                return {
                    "success": True,
                    "action": "delete"
                }

            # ✅ LIMPIAR relaciones previas
            RouteDay.search([
                ('subscription_ids', 'in', subscription.id)
            ]).write({
                "subscription_ids": [(3, subscription.id)]
            })

            # ✅ ASIGNAR NUEVAS
            RouteDay.browse(route_day_ids).write({
                "subscription_ids": [(4, subscription.id)]
            })

            return {
                "success": True,
                "action": "update",
                "subscription_id": subscription.id
            }

        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
