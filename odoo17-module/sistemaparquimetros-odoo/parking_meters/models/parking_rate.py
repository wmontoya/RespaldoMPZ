from odoo import models, fields, api


class InfractionPriceTime(models.Model):
    _name = "parking_meters.parking_rate"
    _description = "Parking Rate"
    _rec_name = "minutes"

    id = fields.Integer(string="Id")
    minutes = fields.Integer(string="Minutes")
    price = fields.Float(string="Price", default=0.0)
    update_date = fields.Datetime(string="Update Date")

    @api.model
    def get_minutes_price(self):
        records = self.search([], order="update_date desc")

        latest_records = {}

        for record in records:
            if record.minutes not in latest_records:
                latest_records[record.minutes] = record

        last_three_records = sorted(latest_records.values(), key=lambda x: x.minutes)[:3]

        result = [
            {
                "id": record.id,
                "minutes": record.minutes,
                "hours": record.minutes / 60,
                "price": record.price,
                "update_date": record.update_date,
            }
            for record in last_three_records
        ]

        return result
