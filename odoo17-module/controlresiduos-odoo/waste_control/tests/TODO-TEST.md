
# Definición de tareas

Se marca con [x] tareas completadas, si ya esta completada y verificada marcar con la "x".

Apuntar las tareas correspondientes, usa la jerarquía como guía, solo se puede completar una tarea principal si todas las tareas hijas se completaron

Llenar la informe de formulario una vez implementada la prueba, plantilla: [Formulario plantilla de test](./docs/TEST_FORMAT.md)

Para el proyecto en código se estará usando el ingles
Para datos y datos de prueba en `data/basic` y `data/demo`

- Pruebas Unitarias
- Pruebas Modulares.

## TODO task (test)

### Unit test

- [x] Realizar test sobre todo el proyecto
  - [x] Definir la entidades menores. (`minor_models`)
    - [x] Ubicaciones (Provincia, Cantón, Distrito, Comunidad). (`test_locations.py`)
      - [x] test_valid_locations
    - [x] Contactos (Choferes, Responsables, Cuadrillas, Centros de Acopio). (`test_contacts.py`)
      - [x] test_valid_contacts
    - [x] Métodos de pago. (`test_payment_methods.py`)
      - [x] test_valid_payment_method_name
      - [x] test_empty_payment_method_name
    - [x] Tipos de residuos. (`test_types_of_waste.py`)
      - [x] test_valid_type_of_waste_name
      - [x] test_empty_type_of_waste_name
    - [x] Estudio de rutas. (`test_routes_study.py`)
      - [x] test_valid_route
      - [x] test_negative_number
      - [x] test_negative_kilometers
    - [x] Estudio de rutas simple. (`test_routes_study_simple.py`)
      - [x] test_validate_positive_values
      - [x] test_validate_negative_number
      - [x] test_validate_negative_kilometers
  - [x] Entidades principales. (`core`)
    - [x] Vehículos y rutas. (`vehicles_routes`)
      - [x] test_historic_vehicles.py
      - [x] test_vehicle_routes.py (sin tests directos; uso routes_study e historic_vehicles)
      - [x] test_routes_study.py
    - [x] Gestión de combustible. (`comb_km`)
      - [x] test_fuel_purchase_orders.py
      - [x] test_kilometers_traveled.py
    - [x] Gestión de residuos. (`waste_management`)
      - [x] test_meat_waste.py
      - [x] test_recycling_on_route.py
      - [x] test_recycling_by_campaigns.py
      - [x] test_waste.py
      - [x] test_buenos_aires_tonnages.py
      - [x] test_purchase_orders_ebi.py
      - [x] test_private_companies.py
      - [x] test_communities_waste_reports.py

## Modular tests

- [x] Definir y realizar pruebas modulares
  - [x] test_modular_comb_km_vehicles_routes.py
  - [x] test_modular_waste_management_routes.py
  - [x] test_modular_full_flow.py
