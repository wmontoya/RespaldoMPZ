from odoo import models, fields, api


class Event(models.Model):
    _name = "sev.event"
    _description = "Evento"
    _rec_name = "id"

    activity_id = fields.Many2one("sev.activity", string="Actividad")

    description = fields.Text(string="Descripción", required=True)
    causes = fields.Text(string="Causas", required=True)
    consequences = fields.Text(string="Consecuencias", required=True)

    event_type_id = fields.Many2one("sev.event_type", string="Tipo de Evento", required=True)
    event_classification_id = fields.Many2one(
        "sev.classification", string="Clasificación", required=True
    )
    event_specification_id = fields.Many2one(
        "sev.specification", string="Especificación", required=True
    )

    probability = fields.Integer(string="Probabilidad", default=1, required=True)
    impact = fields.Integer(string="Impacto", default=1, required=True)
    probability_string = fields.Selection(
        [('1', '✔️ Bajo'), ('2', '⚠️ Medio'), ('3', '❌ Alto')],
        string='Probabilidad',
        required=True,
    )
    impact_string = fields.Selection(
        [('1', '✔️ Bajo'), ('2', '⚠️ Medio'), ('3', '❌ Alto')],
        string='Impacto',
        required=True,
    )

    risk_level = fields.Selection(
        [
            ("low", "Bajo"),
            ("medium", "Medio"),
            ("high", "Alto"),
        ],
        default="low",
        string="Nivel de Riesgo",
        compute='_compute_risk_level',
        store=True
    )
    risk_level_html = fields.Html( compute="_compute_risk_level_html", sanitize=False)

    existent_control_measures = fields.Text(string="Medidas de Control Existentes", required=True)

    actitude = fields.Selection(
        [
            ("negative", "🔴Negativa"),
            ("positive", "🟢Positiva"),
        ],
        string="Actitud",
        required=True,
    )
    aptitude = fields.Selection(
        [
            ("negative", "🔴Negativa"),
            ("positive", "🟢Positiva"),
        ],
        string="Aptitud",
        required=True,
    )
    new_risk_level = fields.Selection(
        [
            ("low", "Bajo"),
            ("medium", "Medio"),
            ("high", "Alto"),
        ],
        default="low",
        string="Nuevo Nivel de Riesgo",
        compute='_compute_new_risk_level',
        store=True
    )
    new_risk_level_html = fields.Html( compute="_compute_new_risk_level_html", sanitize=False)
    acceptance = fields.Selection(
        [
            ("acceptable", "🟢 Aceptable"),
            ("unacceptable", "🔴 Inaceptable"),
        ],
        default="acceptable",
        string="Aceptación",
    )

    creation_date = fields.Date(string="Fecha de Creación", default=fields.Date.today)
    last_update = fields.Date(string="Última Actualización" )
    status = fields.Selection(
        [
            ("active", "Activo"),
            ("inactive", "Inactivo"),
            ("in_progress", "En Progreso"),
            ("completed", "Completado"),
        ],
        default="active",
        string="Estado",
    )

    proposed_actions = fields.One2many(
        "sev.proposed_action", "event_id", string="Acciones Propuestas"
    )

    @api.depends("risk_level")
    def _compute_risk_level_html(self):
        for rec in self:
            rec.risk_level_html = ""
            if rec.risk_level == "low":
                rec.risk_level_html = """
                    <div class="risk-badge risk-low">
                        <i class="fa fa-check-circle"></i>
                        Bajo
                    </div>
                """
            elif rec.risk_level == "medium":
                rec.risk_level_html = """
                    <div class="risk-badge risk-medium">
                        <i class="fa fa-exclamation-triangle"></i>
                        Medio
                    </div>
                """
            elif rec.risk_level == "high":
                rec.risk_level_html = """
                    <div class="risk-badge risk-high">
                        <i class="fa fa-times-circle"></i>
                        Alto
                    </div>
                """

    @api.depends("new_risk_level")
    def _compute_new_risk_level_html(self):
        for rec in self:
            rec.new_risk_level_html = ""
            if rec.new_risk_level == "low":
                rec.new_risk_level_html = """
                    <div class="risk-badge risk-low">
                        <i class="fa fa-check-circle"></i>
                        Bajo
                    </div>
                """
            elif rec.new_risk_level == "medium":
                rec.new_risk_level_html = """
                    <div class="risk-badge risk-medium">
                        <i class="fa fa-exclamation-triangle"></i>
                        Medio
                    </div>
                """
            elif rec.new_risk_level == "high":
                rec.new_risk_level_html = """
                    <div class="risk-badge risk-high">
                        <i class="fa fa-times-circle"></i>
                        Alto
                    </div>
                """

    @api.model
    def create(self, vals):
        if 'creation_date' not in vals:
            vals['creation_date'] = fields.Date.today()
        vals['last_update'] = fields.Date.today()
        return super().create(vals)

    def write(self, vals):
        vals['last_update'] = fields.Date.today()
        return super().write(vals)

    @api.onchange('probability_string')
    def _onchange_probability_string(self):
        if self.probability_string:
            self.probability = int(self.probability_string)

    @api.onchange('impact_string')
    def _onchange_impact_string(self):
        if self.impact_string:
            self.impact = int(self.impact_string)

    @api.depends('probability_string', 'impact_string')
    def _compute_risk_level(self):
        for rec in self:
            prob = int(rec.probability_string) if rec.probability_string else 0
            imp = int(rec.impact_string) if rec.impact_string else 0
            risk = prob * imp                     # 1..9
            if risk <= 3:
                rec.risk_level = 'low'
            elif risk <= 6:
                rec.risk_level = 'medium'
            else:
                rec.risk_level = 'high'

    @api.depends('probability_string', 'impact_string', 'actitude', 'aptitude')
    def _compute_new_risk_level(self):
        for rec in self:
            prob = int(rec.probability_string) if rec.probability_string else 0
            imp = int(rec.impact_string) if rec.impact_string else 0
            risk = prob * imp                     # base 1..9
            print(f"Base risk (probability {prob} * impact {imp}): {risk}")
            # Ajuste por aptitud
            if rec.aptitude == 'positive':
                risk = max(1, risk - 1)
            elif rec.aptitude == 'negative':
                risk = min(9, risk + 1)

            # Ajuste por actitude
            if rec.actitude == 'positive':
                risk = max(1, risk - 1)
            elif rec.actitude == 'negative':
                risk = min(9, risk + 1)

            # Clasificación final
            if risk <= 3:
                rec.new_risk_level = 'low'
            elif risk <= 6:
                rec.new_risk_level = 'medium'
            else:
                rec.new_risk_level = 'high'