def validate_type_of_waste_name(name):
    """Validación simple para tipo de residuo sin ORM."""
    if not name or not name.strip():
        raise ValueError("Type of waste name cannot be empty")
    if len(name.strip()) > 50:
        raise ValueError("Type of waste name cannot exceed 50 characters")
    return name.strip()
