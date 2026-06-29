{
    "version": "1.0",
    "name": "Gestión de residuos",
    "summary": """Gestión de datos del proceso de recolección""",
    "description": """
        Este módulo ofrece una solución completa para las operaciones de gestión de residuos, que incluye:
        * Seguimiento de registros de recolección de residuos
        * Gestión de rutas de vehículos y combustible
        * Gestión de programas de reciclaje
        * Gestión de personal y supervisores
        * Reportes y análisis exhaustivos
    """,
    "author": "JuanCaUNA, EstebanGranados",
    "category": "Administration",
    "license": "LGPL-3",
    "website": "",
    "depends": ["base", "mail"],
    "external_dependencies": {
        "python": [],
    },
    "data": [
        # ** Security first **
        "security/waste_control_groups.xml",
        "security/waste_control_auditor_security.xml",
        "security/waste_control_technical_security.xml",
        "security/waste_control_editor_security.xml",
        "security/waste_control_leadership_security.xml",
        "security/waste_control_it_security.xml",
        "security/ir.model.access.csv",
        # ** Minor views **
        "views/minor_views/payment_methods_view.xml",
        "views/minor_views/products_view.xml",
        "views/minor_views/recycle_programs_view.xml",
        "views/minor_views/routes_view.xml",
        "views/minor_views/types_of_waste_view.xml",
        "views/minor_views/ebi_tariffs_view.xml",
        # Location
        "views/minor_views/locations/provinces_view.xml",
        "views/minor_views/locations/cantons_view.xml",
        "views/minor_views/locations/districts_view.xml",
        "views/minor_views/locations/communities_view.xml",
        # Contact
        "views/minor_views/contacts/collection_centers_view.xml",
        "views/minor_views/contacts/supervisors_view.xml",
        "views/minor_views/contacts/drivers_view.xml",
        "views/minor_views/contacts/squads_view.xml",
        # ** Core views **
        # comb_km
        "views/core/comb_km/bills_view.xml",
        "views/core/comb_km/fuel_purchase_orders_view.xml",
        "views/core/comb_km/kilometers_traveled_view.xml",
        # vehicles_routes
        "views/core/vehicles_routes/historic_vehicles_view.xml",
        "views/core/vehicles_routes/routes_study_view.xml",
        "views/core/vehicles_routes/vehicle_routes_view.xml",
        # waste_management
        "views/core/waste_management/buenos_aires_tonnages_view.xml",
        "views/core/waste_management/communities_waste_reports_view.xml",
        "views/core/waste_management/meat_waste_view.xml",
        "views/core/waste_management/private_companies_view.xml",
        "views/core/waste_management/purchase_orders_ebi_view.xml",
        "views/core/waste_management/waste_view.xml",
        # waste/recycling
        "views/core/waste_management/recycling/recycling_by_campaigns_view.xml",
        "views/core/waste_management/recycling/recycling_on_route_view.xml",
        # ** Reports and wizard **
        # Paper Format
        "data/report_paperformat.xml",
        "reports/core/comb_km/comparative_fuel_cost_report.xml",
        "wizard/reports/core/comb_km/comparative_fuel_cost_wizard_view.xml",
        #
        "reports/core/comb_km/fuel_purchase_orders_report.xml",
        "wizard/reports/core/comb_km/fuel_purchase_orders_wizard_view.xml",
        #
        "reports/core/comb_km/fuel_consumption_by_plate_report.xml",
        "wizard/reports/core/comb_km/fuel_consumption_by_plate_wizard_view.xml",
        #
        "reports/core/comb_km/fuel_efficiency_report.xml",
        "wizard/reports/core/comb_km/fuel_efficiency_wizard_view.xml",
        #
        "reports/core/comb_km/fuel_cost_report.xml",
        "wizard/reports/core/comb_km/fuel_cost_wizard_view.xml",
        #
        "reports/core/comb_km/km_traveled_report.xml",
        "wizard/reports/core/comb_km/km_traveled_wizard_view.xml",
        #
        "reports/core/comb_km/km_per_route_report.xml",
        "wizard/reports/core/comb_km/km_per_route_wizard_view.xml",
        #
        "reports/core/comb_km/km_route_non_recyclable_report.xml",
        "wizard/reports/core/comb_km/km_route_non_recyclable_wizard_view.xml",
        #
        "reports/core/comb_km/fuel_cost_route_non_recyclable_report.xml",
        "wizard/reports/core/comb_km/fuel_cost_route_non_recyclable_wizard_view.xml",
        #
        "reports/core/waste_management/recycling_on_route_report.xml",
        "wizard/reports/core/waste_management/recycling_on_route_wizard_view.xml",
        #
        "wizard/reports/core/waste_management/meat_waste_wizard_view.xml",
        "reports/core/waste_management/meat_waste_report.xml",
        #
        "wizard/reports/core/waste_management/buenos_aires_tonnages_wizard_view.xml",
        "reports/core/waste_management/buenos_aires_tonnages_report.xml",
        #
        "wizard/reports/core/waste_management/purchase_orders_ebi_wizard_view.xml",
        "reports/core/waste_management/purchase_orders_ebi_report.xml",
        #
        "wizard/reports/core/waste_management/private_companies_wizard_view.xml",
        "reports/core/waste_management/private_companies_report.xml",
        #
        "wizard/reports/core/waste_management/communities_waste_wizard_view.xml",
        "reports/core/waste_management/communities_waste_report.xml",
        #
        "wizard/reports/core/waste_management/districts_tonnages_wizard_view.xml",
        "reports/core/waste_management/districts_tonnages_report.xml",
        #
        "wizard/reports/core/waste_management/waste_wizard_view.xml",
        "reports/core/waste_management/waste_report.xml",
        #
        "reports/core/waste_management/waste_disposition_report.xml",
        "wizard/reports/core/waste_management/waste_disposition_wizard_view.xml",
        #
        "reports/core/waste_management/waste_percentage_report.xml",
        "wizard/reports/core/waste_management/waste_percentage_wizard_view.xml",
        #
        "reports/core/waste_management/non_recyclable_waste_report.xml",
        "wizard/reports/core/waste_management/non_recyclable_waste_wizard_view.xml",
        # ** Other **
        "views/main_view.xml",
        # ** Menu structure **
        "views/menu_view.xml",
        # ** Initial data **
        "data/basic/main_view_data.xml",
        "data/basic/locations_data.xml",
        "data/basic/payment_methods_data.xml",
        "data/basic/types_of_waste_data.xml",
    ],
    "demo": [
        # Demo data for testing, strict order
        "data/demo/ebi_tariffs_data.xml",
        "data/demo/minors_entities_demo.xml",
        "data/demo/vehicles_routes_demo.xml",
        "data/demo/comb_km_demo.xml",
        "data/demo/waste_management_demo.xml",
    ],
    "qweb": [],
    "auto_install": False,
    "installable": True,
    "application": True,
    "sequence": 10,
}  # type: ignore
