# -*- coding: utf-8 -*-
{
    "name": "Mature Model",
    "summary": "Mature Model is a module to manage risks into a company",
    "description": """
        This module is used to manage risks into a company
    """,
    "author": "Esteban Najera, Daniel Araya, Sebastian Vargas, Dilan Sancho",
    "website": "https://www.yourcompany.com",
    "category": "mature_model",
    "version": "0.1",
    # any module necessary for this one to work correctly
    "depends": ["shared"],
    # always loaded
    "data": [
        # "security/ir.model.access.csv",

        "views/units.xml",
        "views/evaluations.xml",
        "views/evaluationProcess.xml",
        "views/sections.xml",
        "views/options.xml",
        "views/answers.xml",
        "views/questions.xml",
        "views/menu.xml",
        "security/groups/admin.xml",
        "security/groups/audit.xml",
        "security/groups/internal_control.xml",
    ],
    "installable": True,
    "auto_install": False,
    "application": False,
}
