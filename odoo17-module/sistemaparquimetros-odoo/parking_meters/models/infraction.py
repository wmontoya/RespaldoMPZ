from odoo import models, fields, api
from types import SimpleNamespace
from datetime import datetime, timedelta
import json
import os
from odoo.exceptions import UserError

class Infraction(models.Model):
    _name = "parking_meters.infraction"
    _description = "Infractions"

    id = fields.Integer(string="Id")
    ticket_number = fields.Integer(string="Ticket Number")
    plate_type_id = fields.Many2one("parking_meters.plate_type", string="Plate Type")
    plate_number = fields.Char(string="Plate Number")
    plate_detail_id = fields.Many2one("parking_meters.plate_detail", string="Government Code")
    infraction_price_id = fields.Many2one("parking_meters.infraction_price", string="Infraction Price")
    first_location = fields.Char(string="First Location")
    second_location = fields.Char(string="Second Location")
    third_location = fields.Char(string="Third Location")
    infraction_state_id = fields.Many2one("parking_meters.infraction_state", string="Infraction State")
    registration_date = fields.Datetime(string="Registration Date")
    payment_date = fields.Datetime(string="Payment Date")
    brand_code_id = fields.Many2one("parking_meters.brand", string="Brand")
    color_code_id = fields.Many2one("parking_meters.color", string="Color")
    article_code_id = fields.Many2one("parking_meters.article", string="Article")
    clause_code_id = fields.Many2one("parking_meters.clause", string="Clause")
    vehicle_code_id = fields.Many2one("parking_meters.vehicle_type", string="Vehicle")
    observations = fields.Char(string="Observations")
    latitude = fields.Char(string="Latitude")
    longitude = fields.Char(string="Longitude")
    surcharge = fields.Monetary(string="Surcharge", default=0.0, currency_field="currency_id")
    cancellation_description = fields.Text(string="Cancellation Description")
    cashier_user_id = fields.Many2one("res.users", string="Cashier")
    inspector_user_id = fields.Many2one("res.users", string="Inspector")
    currency_id = fields.Many2one(
        "res.currency",
        string="Moneda",
        default=lambda self: self.env.ref("base.CRC"),
    )

    ticket_number_formatted = fields.Char(string="Ticket Number", compute="_compute_ticket_number_formatted", store=False)
    infraction_price_price = fields.Monetary(
        string="Price", compute="_compute_infraction_price_price", store=False, currency_field="currency_id"
    )
    infraction_total_amount = fields.Monetary(
        string="Price", compute="_compute_infraction_total_amount", store=False, currency_field="currency_id"
    )
    plate_type_description = fields.Char(string="Plate Type", compute="_compute_plate_type_description", store=False)
    infraction_state_description = fields.Char(string="State", compute="_compute_infraction_state_description", store=False)
    map_url = fields.Html("Map", compute="_compute_map_url", store=False, sanitize=False)
    infraction_images = fields.Html(string="Images", compute="_compute_image_list", store=False, sanitize=False)
    infraction_payment_ticket = fields.Html(
        string="Payment Ticket", compute="_compute_infraction_payment_ticket", store=False, sanitize=False
    )
    reprint_infraction = fields.Html(string="Reprint Infraction", compute="_compute_reprint_infraction", store=False, sanitize=False)

    from_parent_readonly = fields.Boolean(compute="_compute_from_context", store=False)

    payment_type_ids = fields.One2many("parking_meters.payment_type", "infraction_id", string="Tipos de Pago")

    @api.depends_context("from_parent_readonly")
    def _compute_from_context(self):
        for rec in self:
            rec.from_parent_readonly = self._context.get("from_parent_readonly", False)

    @api.depends("ticket_number")
    def _compute_ticket_number_formatted(self):
        for record in self:
            record.ticket_number_formatted = str(record.ticket_number)

    @api.depends("ticket_number")
    def _compute_image_list(self):
        for record in self:
            image_model = self.env["parking_meters.image"]
            response = image_model.get_image(
                id_infraction=record.id, registration_date=record.registration_date, ticket_number=record.ticket_number
            )

            if not response:
                record.infraction_images = "<p>No images available</p>"
                continue

            if isinstance(response, tuple) and len(response) > 0:
                response = response[0]

            try:
                images_data = json.loads(response)
                if not isinstance(images_data, list):
                    record.infraction_images = "<p>Invalid image format</p>"
                    continue
                image_tags = "".join(
                    f'<img src="data:image/png;base64,{img}" style="width: 900px; max-width: 1000px; height: auto; max-height: 1200px; margin: 10px;" />'
                    for img in images_data
                )

                record.infraction_images = image_tags if image_tags else "<p>No valid images found</p>"
            except json.JSONDecodeError:
                record.infraction_images = "<p>Invalid JSON response</p>"

    def run_surcharge_update_cron(self):
        infractions = self.search([("infraction_state_id", "=", 1)])
        for infraction in infractions:
            price = infraction.infraction_price_id.price
            current_date = datetime.now()
            infraction_date = infraction.registration_date
            day_counter = (current_date - infraction_date).days

            if day_counter <= 2:
                infraction.surcharge = 0.0
            elif 2 < day_counter <= 30:
                infraction.surcharge = price * 0.02
            else:
                diferencia_meses = round((day_counter - 2) / 30)
                monto_temp = price
                for _ in range(diferencia_meses):
                    monto_temp = monto_temp * 1.02
                infraction.surcharge = monto_temp - price

    @api.depends("infraction_state_id")
    def _compute_infraction_payment_ticket(self):
        if not self:
            return

        all_cancelled = all(rec.infraction_state_id.description == "CANCELADO" for rec in self)
        if not all_cancelled:
            for rec in self:
                rec.infraction_payment_ticket = "<p>No hay infracciones seleccionadas.</p>"
            return

        table_rows = ""
        total = 0.0

        for rec in self:
            amount = rec.infraction_price_id.price if rec.infraction_price_id else 0.0
            interest = rec.surcharge if rec.surcharge else 0.0
            total += amount + interest

            table_rows += f"""
                    <thead>
                        <tr>
                            <th class="fontisiteprint">
                                Número de Placa
                            </th>
                            <th class="fontisiteprint" colspan="2">
                                Tipo de Placa
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                        <td class="fontisiteprint">{rec.plate_number if rec.plate_number else "N/A"}</td>
                        <td class="fontisiteprint" colspan="2">{rec.plate_type_id.description if rec.plate_type_id else "N/A"}</td>
                    </tr>
                    </tbody>
                    <thead>
                        <tr>
                            <th class="fontisiteprint">
                                Fecha
                            </th>
                            <th class="fontisiteprint">
                                # Boleta
                            </th>
                            <th class="fontisiteprint">
                                Monto
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                        <td class="fontisiteprint">{rec.payment_date.strftime("%Y-%m-%d") if rec.payment_date else "N/A"}</td>
                        <td class="fontisiteprint">{rec.ticket_number or "N/A"}</td>
                        <td class="amount-cell fontisiteprint">₡{f"{amount + interest:.2f}"}</td>
                    </tr>
                    </tbody>
                """

        try:
            file_path = os.path.join(os.path.dirname(__file__), "../static/report/invoice_parking_meter.html")
            with open(file_path, "r", encoding="utf-8") as file:
                invoice_html = file.read()

            utc_now = datetime.now()
            cr_time = utc_now - timedelta(hours=6)

            invoice_html = invoice_html.replace("{datenow}", cr_time.strftime("%d/%m/%Y %I:%M:%S %p"))
            invoice_html = invoice_html.replace("{table_rows}", table_rows)
            invoice_html = invoice_html.replace("{totalamount}", f"₡{total:.2f}")
            invoice_html = invoice_html.replace("{cashier}", self.env.user.name)

            # Asignar el recibo generado a TODOS los registros
            for rec in self:
                rec.infraction_payment_ticket = invoice_html

        except Exception as e:
            for rec in self:
                rec.infraction_payment_ticket = f"<p>Error al cargar la factura: {str(e)}</p>"

    @api.depends("infraction_state_id")
    def _compute_reprint_infraction(self):
        for record in self:
            file_path = os.path.join(os.path.dirname(__file__), "../static/report/reprint_parking_meter.html")

            try:
                with open(file_path, "r", encoding="utf-8") as file:
                    invoice_html = file.read()
                adjusted_date = record.registration_date - timedelta(hours=6) if record.registration_date else None
                invoice_html = invoice_html.replace("{date}", adjusted_date.strftime("%d/%m/%Y %H:%M:%S") if adjusted_date else "N/A")
                invoice_html = invoice_html.replace("{ticket}", str(record.ticket_number) if record.ticket_number else "N/A")
                invoice_html = invoice_html.replace("{plate_type}", record.plate_type_id.description if record.plate_type_id else "N/A")
                invoice_html = invoice_html.replace("{plate_number}", record.plate_number if record.plate_number else "N/A")
                invoice_html = invoice_html.replace(
                    "{color}", record.color_code_id.color if record.color_code_id and record.color_code_id.color else "N/A"
                )
                invoice_html = invoice_html.replace(
                    "{brand}", record.brand_code_id.brand if record.brand_code_id and record.brand_code_id.brand else "N/A"
                )
                invoice_html = invoice_html.replace(
                    "{vehicle_type}",
                    record.vehicle_code_id.description if record.vehicle_code_id and record.vehicle_code_id.description else "N/A",
                )
                invoice_html = invoice_html.replace(
                    "{amount}", f"{int(record.infraction_price_id.price) if record.infraction_price_id else 0}"
                )
                invoice_html = invoice_html.replace("{first_location}", record.first_location if record.first_location else "N/A")
                invoice_html = invoice_html.replace("{second_location}", record.second_location if record.second_location else "N/A")
                invoice_html = invoice_html.replace("{third_location}", record.third_location if record.third_location else "N/A")
                invoice_html = invoice_html.replace(
                    "{article}", str(record.article_code_id.article) if record.article_code_id and record.article_code_id.article else "N/A"
                )
                invoice_html = invoice_html.replace(
                    "{article_definition}",
                    record.article_code_id.definition if record.article_code_id and record.article_code_id.definition else "N/A",
                )
                invoice_html = invoice_html.replace(
                    "{clause}",
                    (
                        f"Inciso {record.clause_code_id.name}: {record.clause_code_id.description}"
                        if record.clause_code_id and record.clause_code_id.name and record.clause_code_id.description
                        else ""
                    ),
                )
                invoice_html = invoice_html.replace("{observations}", record.observations if record.observations else "N/A")
                invoice_html = invoice_html.replace(
                    "{inspector}", record.inspector_user_id.name if record.inspector_user_id and record.inspector_user_id.name else "N/A"
                )

                record.reprint_infraction = invoice_html

            except Exception as e:
                record.reprint_infraction = f"<p>Error al cargar la factura: {str(e)}</p>"

    @api.depends("infraction_price_id")
    def _compute_infraction_price_price(self):
        for record in self:
            record.infraction_price_price = record.infraction_price_id.price if record.infraction_price_id else 0.0

            if record.infraction_state_id and record.infraction_state_id.id == 1:
                price = record.infraction_price_id.price
                current_date = datetime.now()
                infraction_date = record.registration_date
                day_counter = (current_date - infraction_date).days

                if day_counter <= 2:
                    record.surcharge = 0.0
                elif 2 < day_counter <= 30:
                    record.surcharge = price * 0.02
                else:
                    diferencia_meses = round((day_counter - 2) / 30)
                    monto_temp = price
                    for _ in range(diferencia_meses):
                        monto_temp = monto_temp * 1.02

                    record.surcharge = monto_temp - price

    @api.depends("infraction_price_id")
    def _compute_infraction_total_amount(self):
        for record in self:
            record.infraction_total_amount = (record.infraction_price_id.price + record.surcharge) if record.infraction_price_id else 0.0

    @api.depends("plate_type_id")
    def _compute_plate_type_description(self):
        for record in self:
            record.plate_type_description = record.plate_type_id.description if record.plate_type_id else "N/A"

    @api.depends("infraction_state_id")
    def _compute_infraction_state_description(self):
        for record in self:
            record.infraction_state_description = record.infraction_state_id.description if record.infraction_state_id else "N/A"

    @api.depends("latitude", "longitude")
    def _compute_map_url(self):
        for record in self:
            if record.latitude and record.longitude and record.latitude != "0" and record.longitude != "0":
                lat = float(record.longitude)
                lon = float(record.latitude)
                margin = 0.0001
                bbox = "{},{},{},{}".format(
                    lon - margin,
                    lat - margin,
                    lon + margin,
                    lat + margin,
                )
                record.map_url = f"<iframe style='width: 935px !important; height: 90% !important;' src='https://www.openstreetmap.org/export/embed.html?bbox={bbox}&marker={lat},{lon}&layer=mapnik' frameborder='0'></iframe>"
            else:
                record.map_url = f"<iframe style='width:  935px !important;height: 90% !important;' src='https://www.openstreetmap.org/export/embed.html?bbox=-83.7037406,9.3718692,-83.7017406,9.3738692&marker=9.3728692,-83.7027406&layer=mapnik' frameborder='0' />"

    def action_open_map_modal(self):
        self.ensure_one()
        return {
            "type": "ir.actions.act_window",
            "name": "Map Information",
            "res_model": "parking_meters.infraction",
            "view_mode": "form",
            "res_id": self.id,
            "view_id": self.env.ref("parking_meters.view_map_modal").id,
            "target": "new",
        }

    def action_open_image_modal(self):
        self.ensure_one()
        return {
            "type": "ir.actions.act_window",
            "name": "Images",
            "res_model": "parking_meters.infraction",
            "view_mode": "form",
            "res_id": self.id,
            "view_id": self.env.ref("parking_meters.view_image_modal").id,
            "target": "new",
        }

    def action_open_reprint_modal(self):
        self.ensure_one()
        return {
            "type": "ir.actions.act_window",
            "name": "Reprint",
            "res_model": "parking_meters.infraction",
            "view_mode": "form",
            "res_id": self.id,
            "view_id": self.env.ref("parking_meters.view_reprint_modal").id,
            "target": "new",
        }

    @api.model
    def set_infraction(self, **kwargs):
        try:

            infraction_values = {
                "ticket_number": kwargs.get("ticket_number"),
                "plate_type_id": kwargs.get("plate_type_id"),
                "plate_number": kwargs.get("plate_number"),
                "plate_detail_id": kwargs.get("plate_detail_id"),
                "infraction_price_id": kwargs.get("infraction_price_id"),
                "first_location": kwargs.get("first_location"),
                "second_location": kwargs.get("second_location"),
                "third_location": kwargs.get("third_location"),
                "infraction_state_id": kwargs.get("infraction_state_id"),
                "registration_date": kwargs.get("registration_date"),
                "payment_date": kwargs.get("payment_date"),
                "brand_code_id": kwargs.get("brand_code_id"),
                "color_code_id": kwargs.get("color_code_id"),
                "article_code_id": kwargs.get("article_code_id"),
                "clause_code_id": kwargs.get("clause_code_id"),
                "vehicle_code_id": kwargs.get("vehicle_code_id"),
                "observations": kwargs.get("observations"),
                "latitude": kwargs.get("latitude"),
                "longitude": kwargs.get("longitude"),
                "surcharge": kwargs.get("surcharge"),
                "cancellation_description": kwargs.get("cancellation_description"),
                "inspector_user_id": kwargs.get("inspector_user_id"),
            }

            self.create(infraction_values)
            range = self.env["parking_meters.range_infraction"].search([("user_code_id", "=", kwargs.get("inspector_user_id"))])
            range.ticket_number = range.ticket_number + 1

            return json.dumps({"data": {"ticket_number": range.ticket_number}})
        except Exception as e:
            return json.dumps({"error": str(e)})

    def action_confirm(self):
        return self.insert_new_payment_action(force=True)

    def insert_new_payment_action(self, force=False):

        total_amount = 0
        infraction_type_payment = self.payment_type_ids
        for payment_type in infraction_type_payment:
            total_amount += payment_type.amount

        if f"{total_amount:.2f}" != f"{self.infraction_total_amount:.2f}":
            raise UserError(
                f"El monto total de los métodos de pago ( ₡{total_amount:.2f} ) no coincide con el monto total de la infracción ( ₡{self.infraction_total_amount:.2f} )."
            )

        if not force:
            return {
                "type": "ir.actions.act_window",
                "name": "¡Atención!",
                "res_model": "parking_meters.infraction",
                "view_mode": "form",
                "target": "new",
                "view_id": self.env.ref("parking_meters.view_confirmation_modal").id,
                "res_id": self.id,
            }

        paid_state = self.env["parking_meters.infraction_state"].search([("description", "=", "CANCELADO")], limit=1)
        if paid_state:
            self.write({"payment_date": datetime.now(), "infraction_state_id": paid_state.id, "cashier_user_id": self.env.user.id})

        self.insert_payment(
            ticket_number=[self.ticket_number],
            email="N/A",
            identification="0123456789",
            ip="N/A",
            phone="N/A",
            name="N/A",
            last_name="N/A",
            date_pay=datetime.now(),
            status_transaction_id=2,
            transaction_type=infraction_type_payment,
        )

        return {
            "type": "ir.actions.act_window",
            "name": "Payment Confirmation",
            "res_model": "parking_meters.infraction",
            "view_mode": "form",
            "view_id": self.env.ref("parking_meters.view_payment_modal").id,
            "target": "new",
            "res_id": self.id,
        }

    def button_invoice_print(self):
        pass

    @api.model
    def insert_payment(self, **kwargs):
        ticket_numbers = kwargs.get("ticket_number")
        if not isinstance(ticket_numbers, (list, tuple)):
            ticket_numbers = [ticket_numbers]
        standard_codes = []
        items_id = []
        sub_amount = 0.0
        interest = 0.0
        list_tiket_numbers = []
        for ticket_number in ticket_numbers:
            infraction = self.search([("ticket_number", "=", ticket_number)], limit=1)
            if not infraction:
                raise ValueError(f"No se encontró una infracción con el ticket_number: {ticket_number}")
            if infraction:
                list_tiket_numbers.append(infraction.ticket_number)
                standard_codes.append(f"{infraction.plate_type_id.description} - {infraction.plate_number}")
                items_id.append(infraction.id)
                sub_amount += infraction.infraction_price_id.price if infraction.infraction_price_id else 0.0
                interest += infraction.surcharge

        standard_code = " | ".join(standard_codes)
        items_id = ",".join(map(str, items_id))
        list_tiket_numbers = ",".join(map(str, list_tiket_numbers))

        invoice_number = self.env["ir.sequence"].next_by_code("parking_meters.temporal_invoice_mip")

        if not invoice_number:
            raise ValueError("No se pudo generar el número de factura temporal. Verifica la secuencia.")

        default_detail = SimpleNamespace(
            amount=sub_amount + interest,
            type_payment="web",
            authorization=kwargs.get("authorization", "000000")
        )
        details = kwargs.get("transaction_type", [])
        payment_details = []

        for detail in (details or [default_detail]):
            payment_details.append(
                (
                    0,
                    0,
                    {
                        "accounting_assistant": "CUF",
                        "standard_code": standard_code,
                        "description": "Multa Por Infrac. Ley Parq. Pago por boleta(s): " + list_tiket_numbers,
                        "status": "al cobro",
                        "cutoff_date": datetime.now(),
                        "item_id": items_id,
                        "balance_id": "MIP",
                        "amount": detail.amount,  # toma el monto del detalle
                        "penalty_amount": 0,
                        "penalties": 0,
                        "account_number": "0",
                        "document_number": f"{datetime.now().year}.{datetime.now().month}-{list_tiket_numbers}",
                        "period": (datetime.now().month + 2) // 3,
                        "balance": 0,
                        "interest_balance": 0,
                        "year": datetime.now().year,
                        # Puedes guardar el tipo de transacción si es necesario
                        "transaction_type": detail.type_payment,
                        "authorization": detail.authorization,
                    },
                )
            )

        payment_values = {
            "date_creation": datetime.now(),
            "date_pay": kwargs.get("date_pay", None),
            "email": kwargs.get("email", ""),
            "identification": kwargs.get("identification", ""),
            "interest": interest,
            "invoice_temp": invoice_number,
            "ip_client": kwargs.get("ip", ""),
            "penalty": 0,
            "phone": kwargs.get("phone", ""),
            "sub_amount": sub_amount,
            "stamp": 0,
            "total_amount": sub_amount + interest,
            "status_transaction_id": kwargs.get("status_transaction_id", 1),
            "authorization": "000000",
            "payment_details_ids": payment_details,
        }

        try:
            payment = self.env["online_payments.payment"].insert_payment(
                payment_values, kwargs.get("name", ""), kwargs.get("last_name", ""), infraction.ticket_number
            )

            return payment
        except Exception as e:
            print(f"Error: {str(e)}")
            raise

    def action_pay_selected(self):
        wizard = self.env["parking_meters.infractions_wizard"].create(
            {
                "infraction_ids": [(6, 0, self.ids)],
            }
        )
        return {
            "type": "ir.actions.act_window",
            "name": "Pagar Infracciones",
            "res_model": "parking_meters.infractions_wizard",
            "view_mode": "form",
            "view_id": self.env.ref("parking_meters.view_infractions_wizard_form").id,
            "target": "new",
            "res_id": wizard.id,
            "target": "current",
        }
