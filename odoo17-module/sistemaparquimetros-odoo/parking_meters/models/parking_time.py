from odoo import models, fields, api
from odoo import exceptions
from datetime import datetime, timedelta, time
import json


class ParkingTime(models.Model):
    _name = "parking_meters.parking_time"
    _description = "Parking Time"
    _rec_name = "id"

    id = fields.Integer(string="Id")
    plate_type_id = fields.Many2one("parking_meters.plate_type", string="Plate Type")
    plate_number = fields.Char(string="Plate Number")
    parking_rate_ids = fields.Many2many("parking_meters.parking_rate", string="Time (Minutes)")
    start_time = fields.Datetime(string="Start Time")
    end_time = fields.Datetime(string="End Time")
    email = fields.Char(string="Email")
    phone = fields.Char(string="Phone Number")
    notified = fields.Boolean(string="Notified", default=False)
    status = fields.Selection(
        [
            ("active", "Active"),
            ("inactive", "Inactive"),
        ],
        string="Parking Time Status",
        default="inactive",
    )
    subscription = fields.Char(string="Subscription")
    consulted = fields.Boolean(string="Consulted", default=False)
    
    def _get_safe_payment_status(self, item_id):
        try:
            resp = self.env['online_payments.payment'].sudo().check_status_item_id(item_id)
            return resp["data"]["status"]["status"] if resp and resp.get("data", {}).get("status", {}).get("status") else "PENDING"
        except Exception as e:
            self.env["ir.logging"].create(
                {
                    "name": "_get_safe_payment_status",
                    "type": "server",
                    "dbname": self.env.cr.dbname,
                    "level": "Error",
                    "message": f"Error item_id={item_id}: {str(e)}",
                    "path": __name__,
                    "func": "get_safe_payment_status",
                    "line": 46,
                }
            )
            return "PENDING"

    
    @api.model
    def get_time_by_plate(self, **kwargs):
        current_time = fields.Datetime.now()
        start_of_day = datetime.combine(current_time, time.min)
        end_of_day = datetime.combine(current_time, time.max)
        
        records = self.search(
            [
                ("plate_number", "=", kwargs.get("plate_number")),
                ("plate_type_id", "=", int(kwargs.get("plate_type_id"))),
                ("start_time", "<=", current_time),
                ("end_time", ">=", current_time),
                ("status", "=", "active")
            ]
        )
        
        all_to_day_records = self.search(
            [
                ("plate_number", "=", kwargs.get("plate_number")),
                ("plate_type_id", "=", int(kwargs.get("plate_type_id"))),
                ("start_time", ">=", start_of_day),
                ("start_time", "<=", end_of_day),
            ]
        )

        next_records = self.search(
            [
                ("plate_number", "=", kwargs.get("plate_number")),
                ("plate_type_id", "=", int(kwargs.get("plate_type_id"))),
                ("start_time", ">", current_time),
                ("end_time", ">", current_time),
                ("status", "=", "active")
            ],
            order="start_time asc",
            limit=1
        )

        remaining_minutes = 0
        remaining_seconds = 0
        id_record = 0
        next_start = None

        if records:
            last_record = records[-1]
            id_record = last_record.id
            remaining_time = last_record.end_time - current_time
            remaining_minutes = int(remaining_time.total_seconds() / 60)
            remaining_seconds = int(remaining_time.total_seconds() % 60)

        if next_records:
            local_start_time = next_records.start_time - timedelta(hours=6)
            next_start = local_start_time.strftime("%Y-%m-%d %H:%M:%S")
      
        return json.dumps({
            "id": id_record,
            "remaining_minutes": remaining_minutes,
            "remaining_seconds": remaining_seconds,
            "next_start_time": next_start,
            "all_to_day_records": [
                {
                    "id": record.id,
                    "start_time": (record.start_time - timedelta(hours=6)).strftime("%Y-%m-%d %H:%M:%S"),
                    "end_time": (record.end_time - timedelta(hours=6)).strftime("%Y-%m-%d %H:%M:%S"),
                    "plate_number": record.plate_number,
                    "plate_type_id": record.plate_type_id.id,
                    "status": self._get_safe_payment_status(record.id)
                }
                for record in all_to_day_records
            ]
        })


    @api.model
    def create_parking_time(self, **kwargs):
        parking_rate_ids = kwargs.get("parking_rate_ids", [])
        start_time_str = kwargs.get("start_time").split(".")[0]
        end_time_str = kwargs.get("end_time").split(".")[0]

        start_time = fields.Datetime.from_string(start_time_str)
        end_time = fields.Datetime.from_string(end_time_str)
        if start_time < datetime.now():
            return json.dumps({"success": False, "message": "La hora de inicio no puede ser menor que la hora actual.", "data": ""})

        if end_time < datetime.now():
            return json.dumps({"success": False, "message": "La hora de fin no puede ser menor que la hora actual.", "data": ""})

        parking_time = {
            "plate_type_id": kwargs.get("plate_type_id"),
            "plate_number": kwargs.get("plate_number"),
            "parking_rate_ids": [(6, 0, parking_rate_ids)],
            "start_time": start_time,
            "end_time": end_time,
            "email": kwargs.get("email"),
            "phone": kwargs.get("phone"),
            "subscription": kwargs.get("subscription"),
        }

        existing_records = self.search(
            [
                ("plate_number", "=", parking_time["plate_number"]),
                ("plate_type_id", "=", parking_time["plate_type_id"]),
                ("start_time", "<", end_time),
                ("end_time", ">", start_time),
                ("status", "=", "active"),
            ]
        )

        if existing_records:
            last_record = existing_records[-1]
            start_time = last_record.start_time
            end_time = last_record.end_time

            start_time_cr = fields.Datetime.context_timestamp(self, start_time)
            end_time_cr = fields.Datetime.context_timestamp(self, end_time)

            message = (
                f"Actualmente se encuentra registrada una boleta para la fecha: "
                f"<strong>{start_time_cr.strftime('%d-%m-%Y')}</strong>, "
                f"desde las: <strong>{start_time_cr.strftime('%I:%M %p')}</strong> "
                f"hasta: <strong>{end_time_cr.strftime('%I:%M %p')}</strong>."
            )

            return json.dumps({"success": False, "message": message, "data": ""})

        new_record = self.create(parking_time)
        if not new_record or not new_record.id:
            raise exceptions.UserError("Failed to create parking time record.")
        
        try:
            response = self._insert_payment(new_record.id,**kwargs)

            return json.dumps({"success": True, "message": "", "data": response })
        except Exception as e:
            print(f"Error: {str(e)}", flush=True)
            
    def _insert_payment(self, item_id, **kwargs):
        
        plate_type = self.env["parking_meters.plate_type"].search([("id", "=", kwargs.get("plate_type_id"))])
        invoice_number = self.env["ir.sequence"].next_by_code("parking_meters.temporal_invoice_bol")
        
        total_minutes = 0
        parking_rate_ids = kwargs.get("parking_rate_ids", [])
        if parking_rate_ids:
            rates = self.env["parking_meters.parking_rate"].browse(parking_rate_ids)
            total_minutes = sum(rate.minutes for rate in rates)
        
        if total_minutes < 60:
            time_description = f"{total_minutes} minutos"
        elif total_minutes == 60:
            time_description = "1 hora"
        else:
            hours = total_minutes // 60
            remaining_minutes = total_minutes % 60
            if remaining_minutes:
                time_description = f"{hours} horas y {remaining_minutes} minutos"
            else:
                time_description = f"{hours} horas"
        
        description = f"Venta de tiempo de Parquímetros por {time_description}"

        payment_values = {
            "date_creation": datetime.now(),
            "email": kwargs.get("email"),
            "identification": kwargs.get("id"),
            "interest": 0,
            "invoice_temp": invoice_number,
            "ip_client": kwargs.get("ip"),
            "penalty": 0,
            "phone": kwargs.get("phone"),
            "sub_amount": kwargs.get("amount"),
            "stamp": 0,
            "total_amount": kwargs.get("amount"),
            "status_transaction_id": 1,
            "payment_details_ids": [
                (
                    0,
                    0,
                    {
                        "accounting_assistant": "CUF",
                        "standard_code": plate_type.description + str(" - ") + kwargs.get("plate_number"),
                        "description": description + str(" - Placa ") + plate_type.description + str(" - ") + kwargs.get("plate_number"),
                        "status": "al cobro",
                        "cutoff_date": datetime.now(),
                        "item_id": item_id,
                        "balance_id": "BOL",
                        "amount": kwargs.get("amount"),
                        "penalty_amount": 0,
                        "penalties": 0,
                        "account_number": "0",
                        "document_number": f"{datetime.now().year}.{datetime.now().month}",
                        "period": (datetime.now().month + 2) // 3,
                        "balance": 0,
                        "interest_balance": 0,
                        "transaction_type": kwargs.get("transaction_type", "web"),
                        "year": datetime.now().year,
                    },
                ),
            ],
        }
        try:
            payment = self.env["online_payments.payment"].insert_payment(
                payment_values, kwargs.get("name"), kwargs.get("last_name"), None
            )
            return payment
        except Exception as e:
            print(f"Error: {str(e)}")

    def parking_time_notification(self):
        config_param = self.env["ir.config_parameter"].sudo()
        minutes_notification = int(config_param.get_param("parking_meters.Notification_Time"))
        current_time = datetime.now()
        notification_time = current_time - timedelta(minutes=minutes_notification + 1)

        start_of_today = (current_time - timedelta(days=1)).replace(
            hour=23, minute=0, second=0, microsecond=0
        )

        records_to_notify = self.search(
            [
                ("start_time", ">=", start_of_today),
                ("end_time", ">=", notification_time),
                ("notified", "=", False),
                ("status", "=", "active"),
            ]
        )

        for record in records_to_notify:
            if not record.notified:
                current_time = fields.Datetime.now()
                remaining_time = record.end_time - current_time

                if timedelta(minutes=minutes_notification) <= remaining_time < timedelta(minutes=minutes_notification + 1):
                    try:
                        self.env["notifications_mpz.oracle_email"].send_time_notification_email(
                            record.email,
                            "Municipalidad de Pérez Zeledón - Pago en línea",
                            record.plate_number,
                            (remaining_time.seconds // 60),
                        )
                    except Exception as e:
                        print(f"Error al enviar el correo electrónico: {str(e)}")

                    try:
                        self.env["notifications_mpz.push_notification"].send_push_notification(
                            "https://172.19.0.48:8069/api/v1/notifications",
                            record.plate_number,
                            record.subscription,
                            (remaining_time.seconds // 60),
                        )
                        print("Notificación push enviada exitosamente.")
                    except Exception as e:
                        print(f"Error al enviar la notificación push: {str(e)}")

                    try:
                        record.write({"notified": True})
                    except Exception as e:
                        print(f"Error al actualizar el registro como notificado: {str(e)}")
