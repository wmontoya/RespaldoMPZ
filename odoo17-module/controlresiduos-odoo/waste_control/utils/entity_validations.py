def non_empty_string(name, max_len=100):
    if not name or not str(name).strip():
        raise ValueError("Value cannot be empty")
    s = str(name).strip()
    if len(s) > max_len:
        raise ValueError(f"Value cannot exceed {max_len} characters")
    return s


def validate_location_province(name):
    return non_empty_string(name, 50)


def validate_location_canton(name):
    return non_empty_string(name, 50)


def validate_location_district(name):
    return non_empty_string(name, 50)


def validate_location_community(name):
    return non_empty_string(name, 50)


def validate_contact_driver(name, license_number):
    non_empty_string(name, 50)
    if not license_number or not str(license_number).strip():
        raise ValueError("License number cannot be empty")
    return True


def validate_contact_responsible(name):
    return non_empty_string(name, 50)


def validate_contact_squad(name):
    return non_empty_string(name, 50)


def validate_contact_collection_center(name):
    return non_empty_string(name, 100)


def validate_payment_method_name(name):
    # Se mantiene compatibilidad con el helper legacy y pruebas modulares.
    from .payment_methods_validation import validate_payment_method_name as _validate

    return _validate(name)


def validate_product(name):
    return non_empty_string(name, 100)


def validate_recycle_program(name):
    return non_empty_string(name, 100)


def validate_route(name):
    return non_empty_string(name, 100)


def validate_historic_vehicle(vehicle_id, meter_reading):
    if vehicle_id <= 0:
        raise ValueError("Vehicle id must be positive")
    if meter_reading < 0:
        raise ValueError("Meter reading must be non-negative")
    return True


def validate_fuel_purchase(quantity, cost):
    if quantity <= 0:
        raise ValueError("Quantity must be positive")
    if cost < 0:
        raise ValueError("Cost cannot be negative")
    return True


def validate_kilometers_traveled(km):
    if km < 0:
        raise ValueError("Kilometers cannot be negative")
    return True


def validate_meat_waste(weight):
    if weight < 0:
        raise ValueError("Weight cannot be negative")
    return True


def validate_recycling_on_route(quantity):
    if quantity < 0:
        raise ValueError("Quantity cannot be negative")
    return True


def validate_recycling_by_campaigns(campaign_name):
    return non_empty_string(campaign_name, 100)


def validate_waste(amount):
    if amount < 0:
        raise ValueError("Amount cannot be negative")
    return True


def validate_buenos_aires_tonnages(tons):
    if tons < 0:
        raise ValueError("Tons cannot be negative")
    return True


def validate_purchase_orders_ebi(order_number):
    return non_empty_string(order_number, 50)


def validate_private_companies(name):
    return non_empty_string(name, 100)


def validate_communities_waste_reports(regions):
    if not regions or not isinstance(regions, list):
        raise ValueError("Regions must be a non-empty list")
    return regions
