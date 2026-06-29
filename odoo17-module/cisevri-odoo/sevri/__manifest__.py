# -*- coding: utf-8 -*-
{
    "name": "Sevri",
    "summary": "Sevri",
    "description": """
        Sevri
    """,
    "author": "Mpz",
    "website": "https://www.perezzeledon.go.cr/",
    "category": "Administration",
    "version": "0.1",
    "depends": ["base", "hr"],
    # always loaded
    "data": [
        # Security - Groups first (noupdate), then access rules
        "security/res_groups.xml",
        "security/ir_admin_user_access.xml",
        "security/ir_audit_user_access.xml",
        "security/ir_internal_control_user_access.xml",
        # Sevri views (cargadas antes que activity para prioridad)
        "views/sevri/sevri_tree.xml",
        "views/sevri/sevri_form.xml",
        "views/sevri/sevri_event_form.xml",
        "views/sevri/sevri_actions.xml",
        # Activity views
        "views/activity/activity_tree.xml",
        "views/activity/activity_form.xml",
        "views/activity/activity_kanban.xml",
        "views/activity/activity_actions.xml",
        # Event views
        "views/event/event_tree.xml",
        "views/event/event_form.xml",
        "views/event/event_actions.xml",
        # Event Type views
        "views/event_type/event_type_tree.xml",
        "views/event_type/event_type_form.xml",
        "views/event_type/event_type_kanban.xml",
        "views/event_type/event_type_actions.xml",
        # Classification views
        "views/classification/classification_tree.xml",
        "views/classification/classification_form.xml",
        "views/classification/classification_kanban.xml",
        "views/classification/classification_actions.xml",
        # Specification views
        "views/specification/specification_tree.xml",
        "views/specification/specification_form.xml",
        "views/specification/specification_kanban.xml",
        "views/specification/specification_actions.xml",
        # Unit views
        "views/unit/unit_tree.xml",
        "views/unit/unit_form.xml",
        "views/unit/unit_kanban.xml",
        "views/unit/unit_actions.xml",
        # Sevri Process views
        "views/sevri_process/sevri_process_tree.xml",
        "views/sevri_process/sevri_process_form.xml",
        "views/sevri_process/sevri_process_actions.xml",
        "views/sevri_process_readonly/sevri_process_readonly_tree.xml",
        "views/sevri_process_readonly/sevri_process_readonly_actions.xml",
        # Proposed Action views
        "views/proposed_action/sevri_proposed_kanban.xml",
        "views/proposed_action/sevri_proposed_actions.xml",
        "views/proposed_action/sevri_proposed_form.xml",
        "views/proposed_action/sevri_proposed_tree.xml",
        # Data files
        "data/event_types.xml",
        "data/classifications.xml",
        "data/specifications.xml",
        # Menu (depends on actions and groups)
        "views/menu.xml",
    ],
"assets": {
         "web.assets_backend": [
             "sevri/static/css/styles.css"
         ],
     },
    "installable": True,
    "auto_install": False,
    "application": True,
}
