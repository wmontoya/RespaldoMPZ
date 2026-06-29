# -*- coding: utf-8 -*-
{
    'name': "CII Autoevaluation",

    'summary': "Municipal Self-Evaluation System",

    'description': """
        Municipal Self-Evaluation System for the Municipality of Perez Zeledon
    """,

    'author': "Municipalidad de Perez Zeledon",
    'website': "https://www.perezzeledon.go.cr",
 
    "category": "Administration",
    'version': '17.0.1.0.0',

    # any module necessary for this one to work correctly
    'depends': ['base','hr'],

    # always loaded
    'data': [
        'security/groups/admin.xml',
        'security/groups/assessee.xml',
        'security/groups/audit.xml',
        'security/groups/internal_control.xml',
        'security/assessee_rule.xml',
        'security/ir.model.access.csv',
        'data/sequence_data.xml',
        'views/surveys.xml',
        'views/survey_answer_wizard.xml',
        'views/survey_answer.xml',
        'views/survey_answer_detailed.xml',
        'views/survey_answer_report.xml',
        'views/answers.xml',
        'views/question.xml',
        'views/section.xml',
        'views/component.xml',
        'views/proposed_action.xml',
        'views/justification.xml',
        'views/access_error.xml',
        'views/menu.xml',
        #'reports/survey_answer_report.xml',
    ],
    'demo': [],
    'installable': True,
    'auto_install': False,
    'application': True,
    'assets': {
        'web.assets_backend': [
            'cii_autoevaluation/static/src/css/style.css',
            'cii_autoevaluation/static/src/js/print_report.js',
            'cii_autoevaluation/static/src/js/answer_tree_refresh.js',
        ],
        'web.report_assets_common': [
            'cii_autoevaluation/static/src/css/report.css',
        ],
    },
}

