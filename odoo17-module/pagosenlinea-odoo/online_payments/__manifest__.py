# -*- coding: utf-8 -*-
{
    "name": "Online payments",
    "summary": "Online payments functions",
    "author": "Municipalidad de Pérez Zeledón",
    "website": "https://www.perezzeledon.go.cr",
    "license": "AGPL-3",
    # Categories can be used to filter modules in modules listing
    # Check https://github.com/odoo/odoo/blob/15.0/odoo/addons/base/data/ir_module_category_data.xml
    # for the full list
    "category": "Administration",
    "version": "0.1",
    # any module necessary for this one to work correctly
    "depends": ["base", "web","notifications_mpz"],
    # always loaded
    "data": [
        "security/res_groups.xml",
        "security/finance_administrator_access.xml",
        "security/webpage_limited_access.xml",
        "security/system_administrator_access.xml",
        
        "data/ir_config_parameter_data.xml",
        "data/cron_job_payment.xml",
           
        "views/payment/view_form.xml",
        "views/payment/view_kanban.xml",
        "views/payment/view_tree.xml",
        "views/payment/actions.xml",
        
        "views/payment_detail/view_form.xml",
        "views/payment_detail/view_kanban.xml",
        "views/payment_detail/view_tree.xml",
        "views/payment_detail/actions.xml",
        
        "views/base_url/view_form.xml",
        "views/base_url/view_tree.xml",
        "views/base_url/actions.xml",
        
        "views/catalog/view_form.xml",
        "views/catalog/view_tree.xml",
        "views/catalog/actions.xml",
        
        "views/yaipan_connection/view_form.xml",
        "views/yaipan_connection/view_tree.xml",
        "views/yaipan_connection/actions.xml",
        
        "views/menu.xml",
        "data/payment_status_data.xml",
        
    ],
    "installable": True,
    "application": True,
}
