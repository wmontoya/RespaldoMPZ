from odoo import models, fields, api, _
from odoo.exceptions import ValidationError
from ...utils.date_utils import MONTH_SELECTION


class KilometersTraveled(models.Model):
    _inherit = ["waste_control.base_model", "mail.thread"]
    _name = "waste_control.kilometers_traveled"
    _description = "Kilómetrajes recorridos"

    date = fields.Date(
        string="Fecha",
        help="Fecha del registro de kilometraje",
    )

    output_km = fields.Integer(
        string="Km de salida",
        help="Lectura del odómetro al inicio de la ruta",
    )
    input_km = fields.Integer(
        string="Km de entrada",
        help="Lectura del odómetro al final de la ruta",
    )

    types_of_waste_id = fields.Many2one(
        comodel_name="waste_control.types_of_waste",
        string="Residuo",
        help="Tipo de residuos recogidos durante la ruta",
    )

    departure_time = fields.Float(
        string="Hora de salida",
        digits=(4, 2),
        help="Hora de salida del vehículo (formato de 24 horas, p. ej., 6:5 para las 6:30 a. m.)",
    )

    return_time = fields.Float(
        string="hora de regreso",
        digits=(4, 2),
        help="Hora de regreso del vehículo (formato de 24 horas, p. ej., 15.0 para las 3:00 p. m.)",
    )

    hours_on_route = fields.Float(
        digits=(4, 2),
        string="Horas en ruta",
        compute="_compute_hours_on_route",
        store=True,
        readonly=True,
        help="Total de horas dedicadas a la ruta",
    )

    overtime_hours = fields.Float(
        string="Horas extras",
        digits=(4, 2),
        compute="_compute_overtime",
        store=True,
        readonly=True,
        help="Horas trabajadas fuera del turno habitual",
    )

    observations = fields.Html(
        string="Observaciones",
        help="Notas adicionales o comentarios",
    )

    # * Relation fields *
    drivers_id = fields.Many2one(
        comodel_name="waste_control.drivers",
        string="Conductor",
        ondelete="restrict",
        help="Información de conductor",
    )

    squads_id = fields.Many2one(
        comodel_name="waste_control.squads",
        string="Cuadrillas",
        ondelete="restrict",
        help="Información de cuadrilla",
    )

    routes_id = fields.Many2one(
        comodel_name="waste_control.routes",
        string="Ruta",
        help="Información de ruta asignada",
    )

    historic_vehicles_id = fields.Many2one(
        comodel_name="waste_control.historic_vehicles",
        string="Vehículo",
        ondelete="restrict",
        help="Información de vehículo",
    )

    # * Compute fields *
    month = fields.Selection(
        selection=MONTH_SELECTION,
        string="Mes",
        compute="_compute_month",
        store=True,
        index=True,
        readonly=True,
    )

    total_km = fields.Integer(
        string="Km Totales",
        compute="_compute_total_km",
        store=True,
        readonly=True,
        help="Total de kilómetros recorridos (km de entrada - km de salida)",
    )

    # * Functions *
    @api.constrains(
        "output_km", "input_km", "total_km", "departure_time", "return_time"
    )
    def _check_ranges(self):
        for record in self:
            if record.output_km < 0:
                raise ValidationError(
                    _("El valor de km de salida no puede ser negativo")
                )
            if record.input_km < 0:
                raise ValidationError(
                    _("El valor de km de entrada no puede ser negativo")
                )
            if record.input_km < record.output_km:
                raise ValidationError(
                    _("El valor de km de entrada no puede ser menor que km de salida")
                )
            if record.total_km < 0:
                raise ValidationError(_("El valor de km totales no puede ser negativo"))
            if record.departure_time < 0 or record.departure_time >= 24:
                raise ValidationError(
                    _("La hora de salida debe estar en el rango 00:00 - 23:59")
                )
            if record.return_time < 0 or record.return_time >= 24:
                raise ValidationError(
                    _("La hora de regreso debe estar en el rango 00:00 - 23:59")
                )
            if record.return_time < record.departure_time:
                # Handle crossing midnight if needed, but for simplicity:
                raise ValidationError(
                    _("La hora de regreso no puede ser antes de la hora de salida")
                )

    @api.depends("output_km", "input_km")
    def _compute_total_km(self):
        for record in self:
            record.total_km = record.input_km - record.output_km

    @api.depends("date")
    def _compute_month(self):
        for record in self:
            record.month = str(record.date.month) if record.date else False

    @api.depends("departure_time", "return_time")
    def _compute_hours_on_route(self):
        for record in self:
            if record.return_time and record.departure_time:
                record.hours_on_route = record.return_time - record.departure_time
            else:
                record.hours_on_route = 0.0

    @api.depends("departure_time", "return_time", "date")
    def _compute_overtime(self):
        for record in self:
            if not record.date or not record.departure_time or not record.return_time:
                record.overtime_hours = 0.0
                continue

            day = record.date.weekday()  # 0=Mon, 6=Sun
            # Logic:
            # Diurno: Mon-Thu (0-3) -> Max 15.0
            #         Fri (4) -> Max 14.0
            # Nocturno: Mon-Fri (0-4) -> Start 19.0 (7pm) -> End 24.0 (12am)
            #           Sat (5) -> Start 18.0 (6pm) -> End 23.0 (11pm)

            # Determine if Nocturno based on start time (e.g. > 16.0)
            is_nocturno = record.departure_time >= 16.0

            limit_hour = 0.0
            if is_nocturno:
                if day <= 4:  # Mon-Fri
                    limit_hour = 24.0  # 12am (end of day)
                elif day == 5:  # Sat
                    limit_hour = 23.0  # 11pm
            else:  # Diurno
                if day <= 3:  # Mon-Thu
                    limit_hour = 15.0  # 3pm
                elif day == 4:  # Fri
                    limit_hour = 14.0  # 2pm
                else:
                    limit_hour = 12.0  # Sat/Sun default

            # Calculate overtime
            overtime = max(0.0, record.return_time - limit_hour)

            # If Diurno start < 6.0? Requirement "6am-3pm".
            if not is_nocturno and record.departure_time < 6.0:
                overtime += 6.0 - record.departure_time

            record.overtime_hours = overtime
