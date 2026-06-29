def validate_routes_study_range(number, kilometers_of_route):
    """Valida valores de rutas sin depender de la capa ORM de Odoo."""
    if number < 0:
        raise ValueError("The route number cannot be negative")
    if kilometers_of_route < 0:
        raise ValueError("The kilometers of the route cannot be negative")
