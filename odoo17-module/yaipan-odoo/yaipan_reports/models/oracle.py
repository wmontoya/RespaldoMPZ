from odoo import models, api
from odoo.exceptions import UserError
import oracledb
import os
import time
import socket

class Oracle(models.TransientModel):
    _name = "yaipan_reports.oracle"
    _description = "Conector temporal a base Oracle"
    _oracle_pool = None
    
    @classmethod
    def _get_oracle_pool(cls):
        if cls._oracle_pool is None:
            try:
                # Configurar el pool con parámetros conservadores
                cls._oracle_pool = oracledb.create_pool(
                    min=1,
                    max=5, 
                    increment=1,
                    timeout=60,  # timeout de obtener conexión del pool
                    max_lifetime_session=3600,  # máximo 1 hora por sesión
                    retry_count=3,
                    retry_delay=1
                )
            except Exception as e:
                print(f"⚠️  No se pudo crear pool Oracle: {e}")
                cls._oracle_pool = False
        
        return cls._oracle_pool if cls._oracle_pool is not False else None

    def _test_tcp_connectivity(self, host, port, timeout=5):
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(timeout)
            result = sock.connect_ex((host, int(port)))
            sock.close()
            return result == 0
        except Exception as e:
            print(f"Error en test TCP: {e}")
            return False

    def _connect_with_retry(self, user, password, dsn, max_retries=3, delay=2):
        last_error = None
        
        for attempt in range(max_retries):
            try:
                conn = oracledb.connect(
                    user=user,
                    password=password,
                    dsn=dsn
                )
                
                return conn
                
            except Exception as e:
                last_error = e
                print(f"✗ Intento #{attempt + 1} falló: {str(e)}")
                
                if attempt < max_retries - 1:  # No esperar en el último intento
                    print(f"Esperando {delay} segundos antes del siguiente intento...")
                    time.sleep(delay)
        
        raise UserError(f"Error de conexión Oracle después de {max_retries} intentos: {str(last_error)}")

    def leer_archivo_sql(self, ruta):
        with open(ruta, "rb") as f:
            contenido = f.read()
        try:
            texto = contenido.decode("utf-8")
        except UnicodeDecodeError:
            try:
                texto = contenido.decode("latin-1")
            except UnicodeDecodeError:
                texto = contenido.decode("cp1252", errors="replace")
        texto = "".join(c for c in texto if c.isprintable() or c in ["\n", "\r", "\t"])
        return texto

    @api.model
    def ejecutar_query_oracle(self, archivo_sql, parametros=None):
        if not archivo_sql.endswith(".sql"):
            raise UserError("El archivo debe tener extensión .sql")

        Param = self.env["ir.config_parameter"].sudo()
        oracle_user = Param.get_param("yaipan_reports.oracle_db_user")
        oracle_password = Param.get_param("yaipan_reports.oracle_db_password")
        oracle_host = Param.get_param("yaipan_reports.oracle_db_host")
        oracle_port = Param.get_param("yaipan_reports.oracle_db_port")
        oracle_service_name = Param.get_param("yaipan_reports.oracle_db_service_name")

        if not all([oracle_user, oracle_password, oracle_host, oracle_port, oracle_service_name]):
            raise UserError("Faltan parámetros de conexión a Oracle.")

        dsn = f"{oracle_host}:{int(oracle_port)}/{oracle_service_name}"
       
        real_file_path = os.path.realpath(__file__)
        sql_file_path = os.path.normpath(os.path.join(
            os.path.dirname(real_file_path), os.path.pardir, "query", archivo_sql
        ))

        if not os.path.isfile(sql_file_path):
            raise UserError(f"No se encontró el archivo SQL: {archivo_sql}")

        sql_query = self.leer_archivo_sql(sql_file_path)

        try:
            if not self._test_tcp_connectivity(oracle_host, oracle_port):
                raise UserError(f"No se puede alcanzar el servidor Oracle en {oracle_host}:{oracle_port}")
            
            with self._connect_with_retry(oracle_user, oracle_password, dsn) as conn:
                with conn.cursor() as cursor:
                    print(f"Ejecutando SQL: {sql_query[:100]}...")
                    if parametros:
                        cursor.execute(sql_query, parametros)
                    else:
                        cursor.execute(sql_query)

                    columnas = [col[0].lower() for col in cursor.description]
                    resultados = [dict(zip(columnas, fila)) for fila in cursor.fetchall()]

        except Exception as e:
            print(f"✗ Error Oracle: {str(e)}")
            
            error_msg = f"Error al ejecutar el query Oracle: {str(e)}"
            if "Connection refused" in str(e):
                error_msg += f"\n\nDiagnóstico: El servidor Oracle en {oracle_host}:{oracle_port} no está disponible."
                error_msg += "\nPosibles causas:"
                error_msg += "\n- El servicio Oracle está detenido"
                error_msg += "\n- Problema de red o firewall"
                error_msg += "\n- El servidor está sobrecargado"
                
            raise UserError(error_msg)

        return resultados