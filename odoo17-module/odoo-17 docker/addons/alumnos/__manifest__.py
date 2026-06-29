# -*- coding: utf-8 -*-
{
    'name': 'Alumnos',
    'version': '1.0',
    'description': """ Alumnos Description """,
    'summary': """ Alumnos Summary """,
    'author': 'william montoya',
    'category': 'Administration',
    'depends': ['base', 'web'],
    'data': [
        "views/module_view/actions.xml",
        "views/module_view/view_form.xml",
        "views/module_view/view_tree.xml",
        "views/module_view/view_kanban.xml",
        "views/module_view/menu.xml",
        "views/owl_view/template.xml",
    ],
     'assets': {
        'web.assets_frontend': [
            'alumnos/static/src/*',
        ],
        'alumnos.assets': [
            # bootstrap
            ('include', 'web._assets_helpers'),
            'web/static/src/scss/pre_variables.scss',
            'web/static/lib/bootstrap/scss/_variables.scss',
            ('include', 'web._assets_bootstrap_backend'),

            # required for fa icons
            'web/static/src/libs/fontawesome/css/font-awesome.css',

            # include base files from framework
            ('include', 'web._assets_core'),

            # remove some files that we do not use to create a minimal bundle
            # ('remove', 'web/static/src/core/**/*'),
            # ('remove', 'web/static/lib/luxon/luxon.js'),
            # 'web/static/src/core/utils/functions.js',
            # 'web/static/src/core/browser/browser.js',
            # 'web/static/src/core/registry.js',
            # 'web/static/src/core/assets.js',
            'alumnos/static/src/**/*',
        ]
    },
    'application': True,
    'installable': True,
    'auto_install': False,
    'license': 'LGPL-3',
}
