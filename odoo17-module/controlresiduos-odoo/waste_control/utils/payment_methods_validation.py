def validate_payment_method_name(name):
    """Validación simple para método de pago sin ORM."""
    if not name or not name.strip():
        raise ValueError("Payment method name cannot be empty")
    if len(name.strip()) > 50:
        raise ValueError("Payment method name cannot exceed 50 characters")
    return name.strip()
