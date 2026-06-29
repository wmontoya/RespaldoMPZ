{
    "name": "Properties MPZ",
    "summary": "Digital administration system for municipal patromonial properties and green areas.",
    "description": """
        Module developed for the Municipalidad de Pérez Zeledón
        oriented to the management and control of patrimonial properties
        and green areas.

        Main functionalities:
        - File registration
        - Property classification
        - Area management
        - Maintenance control
        - Estate and district management
        - Agreement management

        Allows centralizing information and facilitating
        traceability of municipal assets.
    """,
    "author": "Marisol Valverde Retana",
    "category": "Administration",
    "version": "17.0.1.0.0",
     "depends": ["base", "mail"],
    "data": [
        "security/patrimonial_groups.xml",
        "security/patrimonial_access.xml",
        "views/property/action.xml",
          "views/property/property_tree.xml",
          "views/agreement_file/file_tree.xml",
          "views/agreement_file/file_form.xml",
          "views/patrimonial_agreement/agreement_form.xml",
          "views/property/property_form.xml",
          "views/patrimonial_finca/finca_form.xml",
          "views/property_maintenance/maintenance_form.xml",
          "views/menus.xml",
      ],
    "installable": True,
    "application": True,
    "auto_install": False,
    "license": "LGPL-3",
}