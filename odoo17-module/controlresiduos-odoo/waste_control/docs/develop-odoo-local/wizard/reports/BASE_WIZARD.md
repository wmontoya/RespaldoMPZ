# Ejemplo avanzado de uso de base wizard

```py

# ============================================
# EJEMPLO AVANZADO: Wizard con Campos Adicionales
# ============================================
class EjemploAvanzadoWizard(models.TransientModel):
    """
    Ejemplo de wizard con campos adicionales y validaciones personalizadas.
    """

    _name = "waste_control.ejemplo_avanzado_wizard"
    _inherit = "waste_control.base_year_report_wizard"
    _description = "Ejemplo de wizard avanzado"
    _report_action_ref = "waste_control.ejemplo_avanzado_reporte_action"

    # Campos adicionales
    route_id = fields.Many2one(
        "waste_control.routes",
        string="Route",
        help="Optional: Filter by specific route",
    )

    district_id = fields.Many2one(
        "waste_control.districts",
        string="District",
        help="Optional: Filter by specific district",
    )

    include_summary = fields.Boolean(
        string="Include Summary",
        default=True,
        help="Include summary section in the report",
    )

    # Sobrescribir validación si necesitas reglas adicionales
    @api.constrains("year", "route_id")
    def _check_year_range(self):
        """Validación personalizada que extiende la base."""
        # Llamar a la validación base
        super()._check_year_range()

        # Agregar validaciones adicionales
        for record in self:
            if record.route_id and not record.route_id.active:
                raise ValidationError(
                    _("Cannot generate report for inactive route: %s")
                    % record.route_id.name
                )

    # Sobrescribir action_print_report si necesitas lógica adicional
    def action_print_report(self):
        """
        Generar reporte con validaciones adicionales.
        """
        self.ensure_one()

        # Validaciones previas a la generación
        if self.route_id and self.district_id:
            if self.route_id.district_id != self.district_id:
                raise ValidationError(
                    _("Route '%s' does not belong to district '%s'")
                    % (self.route_id.name, self.district_id.name)
                )

        # Llamar al método base para generar el reporte
        return super().action_print_report()

```
