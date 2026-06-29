# -*- coding: utf-8 -*-
{
    "name": "Trashing Management",
    "version": "17.0.1.0.0",
    "description": "Manage trash collection routes and schedules",
    "summary": "Trash Collection Management Module",
    "author": "Municipalidad de Pérez Zeledón",
    "category": "Administration",
    "depends": ["base", "web", "notifications_mpz",],
    "external_dependencies": {
        "python": ["openpyxl"],
    },
    "data": [
        "data/ir_cron_data.xml",
        "data/complaint_sequence.xml",

        "views/route/view_tree.xml",
        "views/route/view_form.xml",
        "views/route/actions.xml",
        
        "views/route_upload/view_form.xml",
        "views/route_upload/actions.xml",
        
        "views/complaint/view_tree.xml",
        "views/complaint/view_form.xml",
        "views/complaint/actions.xml",
        
        "security/res_groups.xml",
        "security/ir_admin_user_access.xml",
        
        "views/menu.xml",
    ],
    "assets": {
        "web.assets_backend": [
            "parking_meters/static/src/js/print_button.js", 
            "parking_meters/static/src/css/style.css",
            ],
    },
    "application": True,
    "installable": True,
    "auto_install": False,
    "license": "LGPL-3",
}
