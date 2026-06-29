# CONTROLADOR API DE TRÁMITES MUNICIPALES PARA LA PLATAFORMA DE AUTOGESTIÓN.
#
# ESTE CONTROLADOR EXPONE LOS SERVICIOS WEB UTILIZADOS POR EL PORTAL DE
# AUTOGESTIÓN PARA LA GESTIÓN DE SOLICITUDES DE TRÁMITES MUNICIPALES.
# PROPORCIONA ENDPOINTS JSON AUTENTICADOS QUE PERMITEN CONSULTAR EL
# HISTORIAL DE TRÁMITES DE UN CONTRIBUYENTE, REGISTRAR NUEVAS SOLICITUDES
# SEGÚN EL TIPO DE TRÁMITE CONFIGURADO Y GENERAR ESTADOS DE CUENTA
# MUNICIPALES DE FORMA AUTOMÁTICA.
#
# LAS OPERACIONES INCLUYEN VALIDACIÓN DE DATOS DE ENTRADA, VERIFICACIÓN
# DE REGLAS DE NEGOCIO, CREACIÓN DE REGISTROS EN ODOO, CONSULTA DE
# INFORMACIÓN RELACIONADA CON LOS CONTRIBUYENTES Y DEVOLUCIÓN DE
# RESPUESTAS ESTRUCTURADAS EN FORMATO JSON PARA SU CONSUMO DESDE EL SPA.
#
# PARA EL TRÁMITE DE ESTADO DE CUENTA, EL CONTROLADOR DELEGA LA LÓGICA
# DE NEGOCIO AL MODELO CORRESPONDIENTE, EL CUAL CONSULTA LOS SALDOS
# PENDIENTES DEL CONTRIBUYENTE, GENERA EL DOCUMENTO PDF, ENVÍA EL
# CORREO ELECTRÓNICO Y REGISTRA EL TRÁMITE DENTRO DEL SISTEMA.
#
# TODOS LOS ENDPOINTS ESTÁN DISEÑADOS PARA SER CONSUMIDOS POR EL
# MIDDLEWARE Y LAS APLICACIONES DE AUTOGESTIÓN MEDIANTE AUTENTICACIÓN
# BASADA EN SESSION_ID DE ODOO.
from odoo import fields, http
from odoo.http import request


class ProcedureRequestController(http.Controller):
    """Crea y lista solicitudes de trámite municipal para el SPA de autogestión.

    Mismo patrón que los demás controladores (json / auth user / csrf False).
    El middleware (yaipan_reports_api) se autentica con session_id y consume
    estos endpoints.
    """

    @http.route(
        "/api/v1/procedure_requests",
        type="json",
        auth="user",
        methods=["POST"],
        csrf=False,
    )
    def list_procedure_requests(self, **kwargs):
        try:
            cedula = (kwargs.get("cedula") or "").strip()
            if not cedula:
                return {
                    "success": False,
                    "data": None,
                    "message": "Debe proporcionar una cédula",
                }

            model = request.env["yaipan_reports.procedure_request"].sudo()

            domain = [("cedula", "=", cedula)]
            # Filtro opcional por tipo de trámite: el historial de cada trámite
            # muestra únicamente las solicitudes de ese tipo.
            type_id = kwargs.get("type_id")
            if type_id:
                domain.append(("type_id", "=", int(type_id)))

            records = model.search(domain, order="create_date desc")
            state_labels = dict(model._fields["state"].selection)

            data = []
            for record in records:
                create_dt = (
                    fields.Datetime.context_timestamp(record, record.create_date)
                    if record.create_date
                    else False
                )
                done_dt = (
                    fields.Datetime.context_timestamp(record, record.done_date)
                    if record.done_date
                    else False
                )
                data.append(
                    {
                        "id": record.id,
                        "number": record.name,
                        "type": record.type_id.name or "",
                        "state": record.state,
                        "state_label": state_labels.get(record.state, record.state),
                        "create_date": create_dt.strftime("%d/%m/%Y %H:%M")
                        if create_dt
                        else "",
                        "done_date": done_dt.strftime("%d/%m/%Y %H:%M")
                        if done_dt
                        else "",
                        "cancel_reason": record.cancel_reason or "",
                        "property_number": record.property_number or "",
                    }
                )

            return {
                "success": True,
                "data": data,
                "message": "Trámites obtenidos correctamente.",
            }
        except Exception as e:
            return {
                "success": False,
                "data": None,
                "message": f"Error al obtener los trámites: {str(e)}",
            }

    @http.route(
        "/api/v1/procedure_requests/create",
        type="json",
        auth="user",
        methods=["POST"],
        csrf=False,
    )
    def create_procedure_request(self, **kwargs):
        try:
            cedula = (kwargs.get("cedula") or "").strip()
            email = (kwargs.get("email") or "").strip()
            phone = (kwargs.get("phone") or "").strip()
            type_id = kwargs.get("type_id")
            property_number = (kwargs.get("property_number") or "").strip()

            if not cedula:
                return {
                    "success": False,
                    "data": None,
                    "message": "Debe proporcionar una cédula",
                }
            if not email:
                return {
                    "success": False,
                    "data": None,
                    "message": "Debe proporcionar un correo electrónico",
                }
            if not type_id:
                return {
                    "success": False,
                    "data": None,
                    "message": "Debe proporcionar el tipo de trámite",
                }

            procedure_type = (
                request.env["yaipan_reports.procedure_type"]
                .sudo()
                .browse(int(type_id))
            )
            if not procedure_type.exists() or not procedure_type.active:
                return {
                    "success": False,
                    "data": None,
                    "message": "El tipo de trámite no existe o no está activo",
                }

            if procedure_type.requires_property and not property_number:
                return {
                    "success": False,
                    "data": None,
                    "message": "Debe indicar el número de finca para este trámite",
                }

            vals = {
                "cedula": cedula,
                "email": email,
                "phone": phone,
                "type_id": procedure_type.id,
                "state": "draft",
            }
            if procedure_type.requires_property:
                vals["property_number"] = property_number

            record = (
                request.env["yaipan_reports.procedure_request"].sudo().create(vals)
            )

            return {
                "success": True,
                "data": {
                    "id": record.id,
                    "number": record.name,
                    "state": record.state,
                },
                "message": "Trámite registrado correctamente.",
            }
        except Exception as e:
            return {
                "success": False,
                "data": None,
                "message": f"Error al registrar el trámite: {str(e)}",
            }

    @http.route(
        "/api/v1/procedure_requests/account_statement",
        type="json",
        auth="user",
        methods=["POST"],
        csrf=False,
    )
    def create_account_statement(self, **kwargs):
        """Genera y envía por correo el estado de cuenta del contribuyente.

        Solo crea el registro de trámite y envía el correo si existen saldos
        del tipo solicitado (vencido / al_cobro / total).
        """
        try:
            cedula = (kwargs.get("cedula") or "").strip()
            email = (kwargs.get("email") or "").strip()
            phone = (kwargs.get("phone") or "").strip()
            statement_type = (kwargs.get("statement_type") or "").strip()

            if not cedula:
                return {"success": False, "message": "Debe proporcionar una cédula"}
            if not email:
                return {
                    "success": False,
                    "message": "Debe proporcionar un correo electrónico",
                }
            if not statement_type:
                return {
                    "success": False,
                    "message": "Debe indicar el tipo de estado de cuenta",
                }

            return (
                request.env["yaipan_reports.procedure_request"]
                .sudo()
                .create_account_statement_request(
                    cedula=cedula,
                    email=email,
                    phone=phone,
                    statement_type=statement_type,
                )
            )
        except Exception as e:
            return {
                "success": False,
                "message": f"Error al generar el estado de cuenta: {str(e)}",
            }
