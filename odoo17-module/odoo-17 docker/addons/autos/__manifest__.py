# -*- coding: utf-8 -*-
{
    "name": "autos",
    "summary": "Reservation for facilities",
    "author": "Municipalidad de Pérez Zeledón",
    "website": "https://www.yourcompany.com",
    # Categories can be used to filter modules in modules listing
    # Check https://github.com/odoo/odoo/blob/15.0/odoo/addons/base/data/ir_module_category_data.xml
    # for the full list
    "category": "Administration",
    "version": "0.1",
    # any module necessary for this one to work correctly
    "depends": ["base"],
    # always loaded
    "data": [
        "views/facility_group/actions.xml",
        "views/facility_group/view_form.xml",
        "views/facility_group/view_tree.xml",
        "views/facility_group/view_kanban.xml",
        "views/facility_group/menu.xml",
    ],
    "css": [
        # Ruta relativa al archivo CSS en tu módulo
        "static/src/css/styles.css",
        "static/src/css/bootstrap.min.css",
    ],
    "js": ["static/src/js/bootstrap.bundle.min.js"],
    # only loaded in demonstration mode
    # 'demo': [
    #     'demo/demo.xml',
    # ],
    "installable": True,
    "application": True,
}
