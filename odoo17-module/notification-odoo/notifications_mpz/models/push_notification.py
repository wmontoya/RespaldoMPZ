from odoo import models
import requests
requests.packages.urllib3.disable_warnings()

class PushNotification(models.Model):
    _name = "notifications_mpz.push_notification"
    _description = "Push Notification"
    _rec_name = "id"

    def send_push_notification(self, server, plate_number, subscription, remaining_time):
        try:
            payload = {
                "subscription": subscription,
                "plate_number": plate_number,
                "remaining_time": remaining_time
            }
            
            headers = {
                "Content-Type": "application/json"
            }
            
            response = requests.post(server, headers=headers, json=payload, verify=False)

            if response.status_code == 200:
                print("Notificación enviada exitosamente.")
            else:
                print(f"Error al enviar la notificación: {response.status_code} - {response.text}")

        except Exception as e:
            print(f"Error al enviar la notificación: {str(e)}")
            
    def send_trash_push_notification(self, server, message, subscription):
        try:
            payload = {
                "subscription": subscription,
                "message": message
            }
            
            headers = {
                "Content-Type": "application/json"
            }
            
            response = requests.post(server, headers=headers, json=payload, verify=False)

            if response.status_code == 200:
                print("Notificación enviada exitosamente.")
            else:
                print(f"Error al enviar la notificación: {response.status_code} - {response.text}")

        except Exception as e:
            print(f"Error al enviar la notificación: {str(e)}")