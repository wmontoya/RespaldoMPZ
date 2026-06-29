# -*- coding: utf-8 -*-
{
    'name': "Gestión de Boletas",

    'summary': "Módulo para gestión de boletas de ventas y tipos de construcción",

    'description': """
Módulo para gestionar:
- Boletas de ventas
- Tipos de pisos
- Tipos de paredes
- Tipos de techos
- Usuarios del sistema
- Evidencias asociadas a las boletas
    """,

    'author': "Equipo de Desarrollo - Dilan Sancho",
    'website': "Municipalidad de San Isidro",

    'category': 'Administration',
    'version': '1.0',
    'license': 'LGPL-3',

    'depends': ['base'],

    'data': [
        'security/res_groups.xml',
        'security/ir.model.access.xml',
        'data/tipos_pisos.xml',
        'data/tipos_techos.xml',
        'data/tipos_paredes.xml',
        'data/distritos.xml',
        'data/sequence.xml',
        'views/inspector/action.xml',
        'views/inspection/inspection_form.xml',
        'views/inspector/inspector_form.xml',
        'views/inspector/inspector_tree.xml',
        'views/boleta/boleta_tree.xml',
        'views/boleta/boleta_form.xml',
        'views/boleta/boleta_search.xml',
        'views/boleta/action.xml',
        'views/evidencia/evidencia_form.xml',
        'views/tipos_piso/piso_tree.xml',
        'views/tipos_piso/piso_form.xml',
        'views/tipos_piso/action.xml',
        'views/tipos_pared/pared_tree.xml',
        'views/tipos_pared/pared_form.xml',
        'views/tipos_pared/action.xml',
        'views/tipos_techo/techo_tree.xml',
        'views/tipos_techo/techo_form.xml',
        'views/tipos_techo/action.xml',
        'views/menus.xml',
    ],
    # 'demo': [],
    'installable': True,
    'application': True,
    'post_init_hook': 'post_init_hook',
}

