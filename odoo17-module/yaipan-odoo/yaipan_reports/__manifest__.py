{
    "name": "Yaipan Reports",
    "version": "1.0",
    "summary": "Module for Reports from yaipan",
    "author": "Municipalidad de Pérez Zeledón",
    "website": "https://www.perezzeledon.go.cr",
    "sequence": 10,
    "description": """
                This module manages property valuation records, including owner details,
                location, area, and land/construction values.
    """,
    "category": "Administration",
    "version": "0.1",
    "depends": ["base", "mail", "online_payments", "notifications_mpz"],
    "data": [
        "data/sequences.xml",
        "security/res_groups.xml",
        "security/ir_admin_user_access.xml",
        "security/ir_web_access.xml",

        "views/parameter/actions.xml",
        "views/parameter/view_form.xml",

        "views/service/actions.xml",
        "views/service/views.xml",

        "data/services.xml",

        "views/procedure_type/actions.xml",
        "views/procedure_type/views.xml",

        "views/procedure_request/actions.xml",
        "views/procedure_request/cancel_wizard_views.xml",
        "views/procedure_request/views.xml",

        "data/procedure_types.xml",

        "views/menu.xml"
    ],
    "demo": [],
    "installable": True, 
    "application": True,
    "auto_install": False,
    "license": "LGPL-3",
    "external_dependencies": {
        "python": ["oracledb"]
    },
    "post_init_hook": "post_init_hook",
    "uninstall_hook": "uninstall_hook",
}
