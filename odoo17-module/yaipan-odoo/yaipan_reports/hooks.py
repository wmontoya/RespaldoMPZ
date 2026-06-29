import logging
from odoo import api, SUPERUSER_ID

_logger = logging.getLogger(__name__)


def post_init_hook(env):
    """
    Hook que se ejecuta después de la instalación del módulo yaipan_reports.
    Configura los parámetros de Oracle si no existen.
    """
    _logger.info("Ejecutando post_init_hook para yaipan_reports...")

    # Parámetros Oracle configurados (usar IP real, no localhost)
    oracle_params = {
        'yaipan_reports.oracle_db_user': 'dec',
        'yaipan_reports.oracle_db_password': 'decsa',
        'yaipan_reports.oracle_db_host': '172.19.0.84',  # IP real del servidor Oracle
        'yaipan_reports.oracle_db_port': '1521',
        'yaipan_reports.oracle_db_service_name': 'bdmpzerp'
    }

    try:
        config_param_model = env['ir.config_parameter']

        for param_key, default_value in oracle_params.items():
            # Verificar si el parámetro ya existe
            existing_param = config_param_model.search([('key', '=', param_key)], limit=1)

            if not existing_param:
                # Crear el parámetro si no existe
                config_param_model.create({
                    'key': param_key,
                    'value': default_value
                })
                _logger.info(f"Parámetro Oracle creado: {param_key} = {default_value}")
            else:
                _logger.info(f"Parámetro Oracle ya existe: {param_key}")

        _logger.info("Configuración Oracle completada exitosamente")

        # Mostrar mensaje informativo
        _logger.info("="*60)
        _logger.info("YAIPAN REPORTS - CONFIGURACIÓN ORACLE")
        _logger.info("="*60)
        _logger.info("Se han configurado los parámetros de Oracle por defecto.")
        _logger.info("IMPORTANTE: Debe actualizar estos valores con los datos reales")
        _logger.info("de su base de datos Oracle.")
        _logger.info("")
        _logger.info("Para actualizar los parámetros:")
        _logger.info("1. Vaya a: Configuración > Técnico > Parámetros > Parámetros del sistema")
        _logger.info("2. Busque los parámetros que empiecen con 'yaipan_reports.oracle_'")
        _logger.info("3. Actualice con los valores correctos de su entorno")
        _logger.info("="*60)

    except Exception as e:
        _logger.error(f"Error en post_init_hook de yaipan_reports: {str(e)}")
        # No relanzamos la excepción para no fallar la instalación


def uninstall_hook(env):
    """
    Hook que se ejecuta antes de la desinstalación del módulo.
    Opcionalmente puede limpiar los parámetros Oracle.
    """
    _logger.info("Ejecutando uninstall_hook para yaipan_reports...")
    
    # Por defecto no eliminamos los parámetros al desinstalar
    # para preservar la configuración del usuario
    # Si se desea eliminar, descomentar el código siguiente:
    
    # try:
    #     # Eliminar parámetros Oracle
    #     oracle_params = env['ir.config_parameter'].search([
    #         ('key', 'like', 'yaipan_reports.oracle_%')
    #     ])
    #
    #     if oracle_params:
    #         oracle_params.unlink()
    #         _logger.info(f"Eliminados {len(oracle_params)} parámetros Oracle")
    #
    # except Exception as e:
    #     _logger.error(f"Error en uninstall_hook de yaipan_reports: {str(e)}")
    
    _logger.info("Desinstalación de yaipan_reports completada")