from datetime import date
from itertools import count
from odoo import models, fields, api

class RouteSubscription(models.Model):
    _name = "trash.route_subscription"

    subscription_code = fields.Text(string="Subscription Code", required=True)

    def _today_day_code(self):
        return date.today().strftime('%a').upper()[:3]

    def _matches_iteration(self, route_day):
        today = date.today()
        iteration = route_day.day_iteration

        if iteration == "SEMANAL":
            return True

        if iteration == "QUINCENAL":
            quincenal_dates = route_day.quincenal_date_ids.mapped("collection_date")
            return any(
                fields.Date.to_date(collection_date) == today
                for collection_date in quincenal_dates
                if collection_date
            )

        if iteration == "MENSUAL":
            return today.day == 1

        return False


    def send_trash_notifications(self):
        DAY_NAME_TO_CODE = {
            'monday': 'MON',
            'tuesday': 'TUE',
            'wednesday': 'WED',
            'thursday': 'THU',
            'friday': 'FRI',
            'saturday': 'SAT',
            'sunday': 'SUN',
        }

        today_code = self._today_day_code()

        Subscription = self.env['trash.route_subscription']
        RouteDay = self.env['trash.route_day']

        subscriptions = Subscription.search([])
        for subscription in subscriptions:
            # 🔹 obtener días de ruta suscritos
            route_days = RouteDay.search([
                ('subscription_ids', 'in', subscription.id)
            ])

            for route_day in route_days:

                # 1️⃣ validar día de la semana
                raw_days = route_day.day_ids.mapped('name')
                day_codes = [
                    DAY_NAME_TO_CODE.get(day.lower())
                    for day in raw_days
                    if DAY_NAME_TO_CODE.get(day.lower())
                ]

                if today_code not in day_codes:
                    continue

                if not self._matches_iteration(route_day):
                    continue

                route = route_day.route_id

                # 3️⃣ armar mensaje
                message = (
                    f"🗺️ Ruta: {route.name}\n"
                    f"📍 Sector: {route_day.sector_id.name_sector}\n"
                    f"♻️ Tipo: {route_day.waste_type}\n"
                    f"🕒 Horario: {route_day.collection_time}"
                )

                # 4️⃣ enviar push
                try:
                    self.env["notifications_mpz.push_notification"].send_trash_push_notification(
                        "https://172.19.0.48:8069/api/v1/trash/notifications",
                        message,
                        subscription.subscription_code
                    )

                except Exception as e:
                    print(f"❌ Error enviando push: {e}")


