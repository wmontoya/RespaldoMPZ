# -*- coding: utf-8 -*-
from datetime import datetime, timezone
from odoo import http
from odoo.http import request


PUBLIC_TO_INTERNAL_STATE = {
    "registered": "registered",
    "registrada": "registered",
    "in_review": "in_review",
    "in-review": "in_review",
    "en-revision": "in_review",
    "finished": "finished",
    "resolved": "finished",
    "resuelta": "finished",
}

INTERNAL_TO_PUBLIC_STATE = {
    "registered": "registrada",
    "in_review": "en-revision",
    "finished": "resuelta",
}


def _normalize_state(value):
    if not value:
        return None
    return PUBLIC_TO_INTERNAL_STATE.get(str(value).strip().lower())


def _safe_int(value, default_value):
    try:
        return int(value)
    except (TypeError, ValueError):
        return default_value


def _parse_iso_datetime(value):
    if not value:
        return False

    if isinstance(value, datetime):
        parsed = value
    else:
        normalized = str(value).strip().replace("Z", "+00:00")
        parsed = datetime.fromisoformat(normalized)

    if parsed.tzinfo:
        parsed = parsed.astimezone(timezone.utc).replace(tzinfo=None)

    return parsed


class ComplaintController(http.Controller):

    @staticmethod
    def _format_datetime(value):
        if not value:
            return None
        return value.replace(tzinfo=timezone.utc).isoformat().replace("+00:00", "Z")

    @staticmethod
    def _serialize_complaint(complaint):
        reported_at = complaint.reported_at or complaint.create_date
        return {
            "id": complaint.external_id or complaint.name or str(complaint.id),
            "cedula": complaint.id_number,
            "nombre": complaint.citizen_name,
            "tipo": complaint.complaint_type,
            "descripcion": complaint.description,
            "fecha": ComplaintController._format_datetime(reported_at),
            "estado": INTERNAL_TO_PUBLIC_STATE.get(complaint.state, complaint.state),
            "respuesta": complaint.response or None,
        }

    @staticmethod
    def _group_by_id_number(serialized_complaints):
        grouped = {}
        for complaint in serialized_complaints:
            grouped.setdefault(complaint["cedula"], []).append(complaint)
        return grouped

    @http.route(
        "/api/v1/trash/complaints",
        type="json",
        auth="public",
        methods=["POST"],
        csrf=False
    )
    def create_complaint(self, **kwargs):
        """
        Create a complaint using Spanish or English input keys.
        """
        try:
            id_number = kwargs.get("id_number") or kwargs.get("cedula")
            citizen_name = kwargs.get("citizen_name") or kwargs.get("nombre")
            complaint_type = kwargs.get("complaint_type") or kwargs.get("tipo")
            description = kwargs.get("description") or kwargs.get("descripcion")
            response_text = kwargs.get("response", kwargs.get("respuesta"))
            internal_notes = kwargs.get("internal_notes")
            provided_state = kwargs.get("state") or kwargs.get("estado")
            provided_date = kwargs.get("reported_at") or kwargs.get("fecha")
            external_id = kwargs.get("external_id") or kwargs.get("id")

            if not id_number:
                return {"success": False, "error": "id_number (or cedula) is required"}

            if not citizen_name:
                return {"success": False, "error": "citizen_name (or nombre) is required"}

            if not complaint_type:
                return {"success": False, "error": "complaint_type (or tipo) is required"}

            if not description:
                return {"success": False, "error": "description (or descripcion) is required"}

            state = _normalize_state(provided_state) if provided_state else "registered"
            if provided_state and not state:
                return {"success": False, "error": "Invalid state value"}

            reported_at = False
            if provided_date:
                try:
                    reported_at = _parse_iso_datetime(provided_date)
                except ValueError:
                    return {"success": False, "error": "Invalid fecha/reported_at format"}

            complaint_values = {
                "id_number": id_number,
                "citizen_name": citizen_name,
                "complaint_type": complaint_type,
                "description": description,
                "state": state,
                "response": response_text if response_text else False,
                "internal_notes": internal_notes if internal_notes else False,
            }

            if external_id:
                complaint_values["external_id"] = external_id

            if reported_at:
                complaint_values["reported_at"] = reported_at

            complaint = request.env["trash.complaint"].sudo().create(complaint_values)

            return {
                "success": True,
                "complaint_id": complaint.id,
                "complaint_number": complaint.name,
                "data": self._serialize_complaint(complaint),
                "message": "Complaint registered successfully"
            }

        except Exception as error:
            return {"success": False, "error": str(error)}

    @http.route(
        "/api/v1/trash/complaints/<int:complaint_id>",
        type="json",
        auth="public",
        methods=["GET"],
        csrf=False
    )
    def get_complaint(self, complaint_id, **kwargs):
        """
        Get a complaint by internal numeric ID.
        """
        try:
            complaint = request.env["trash.complaint"].sudo().browse(complaint_id)
            if not complaint.exists():
                return {"success": False, "error": "Complaint not found"}

            return {
                "success": True,
                "data": self._serialize_complaint(complaint),
            }

        except Exception as error:
            return {"success": False, "error": str(error)}

    @http.route(
        "/api/v1/trash/complaints/by-id-number/<string:id_number>",
        type="json",
        auth="public",
        methods=["GET", "POST"],
        csrf=False
    )
    def get_complaints_by_id_number(self, id_number, **kwargs):
        """
        Return complaints grouped by ID number in this shape:
        { "1-2345-6789": [ ... ] }
        """
        try:
            complaints = request.env["trash.complaint"].sudo().search(
                [("id_number", "=", id_number)],
                order="reported_at desc, create_date desc"
            )
            serialized = [self._serialize_complaint(record) for record in complaints]

            return {
                "success": True,
                "data": {id_number: serialized},
                "total": len(serialized),
            }

        except Exception as error:
            return {"success": False, "error": str(error)}

    @http.route(
        "/api/v1/trash/complaints/search",
        type="json",
        auth="public",
        methods=["POST"],
        csrf=False
    )
    def search_complaints(self, **kwargs):
        """
        Search complaints and return both list and grouped formats.
        """
        try:
            id_number = kwargs.get("id_number") or kwargs.get("cedula")
            provided_state = kwargs.get("state") or kwargs.get("estado")
            date_from = kwargs.get("date_from")
            date_to = kwargs.get("date_to")
            limit = _safe_int(kwargs.get("limit", 50), 50)

            domain = []
            if id_number:
                domain.append(("id_number", "=", id_number))

            if provided_state:
                normalized_state = _normalize_state(provided_state)
                if not normalized_state:
                    return {"success": False, "error": "Invalid state value"}
                domain.append(("state", "=", normalized_state))

            if date_from:
                domain.append(("reported_at", ">=", date_from))

            if date_to:
                domain.append(("reported_at", "<=", date_to))

            complaints = request.env["trash.complaint"].sudo().search(
                domain,
                limit=limit,
                order="reported_at desc, create_date desc"
            )
            serialized = [self._serialize_complaint(record) for record in complaints]

            return {
                "success": True,
                "data": serialized,
                "grouped_by_id_number": self._group_by_id_number(serialized),
                "total": len(serialized)
            }

        except Exception as error:
            return {"success": False, "error": str(error)}

    @http.route(
        "/api/v1/trash/complaints/<int:complaint_id>",
        type="json",
        auth="public",
        methods=["PUT"],
        csrf=False
    )
    def update_complaint(self, complaint_id, **kwargs):
        """
        Update complaint fields.
        """
        try:
            complaint = request.env["trash.complaint"].sudo().browse(complaint_id)
            if not complaint.exists():
                return {"success": False, "error": "Complaint not found"}

            values = {}

            if "response" in kwargs or "respuesta" in kwargs:
                values["response"] = kwargs.get("response", kwargs.get("respuesta")) or False

            if "internal_notes" in kwargs:
                values["internal_notes"] = kwargs["internal_notes"] or False

            if "citizen_name" in kwargs or "nombre" in kwargs:
                values["citizen_name"] = kwargs.get("citizen_name", kwargs.get("nombre"))

            if "complaint_type" in kwargs or "tipo" in kwargs:
                values["complaint_type"] = kwargs.get("complaint_type", kwargs.get("tipo"))

            if "description" in kwargs or "descripcion" in kwargs:
                values["description"] = kwargs.get("description", kwargs.get("descripcion"))

            if "state" in kwargs or "estado" in kwargs:
                provided_state = kwargs.get("state", kwargs.get("estado"))
                normalized_state = _normalize_state(provided_state)
                if not normalized_state:
                    return {"success": False, "error": "Invalid state value"}
                values["state"] = normalized_state

            if "reported_at" in kwargs or "fecha" in kwargs:
                provided_date = kwargs.get("reported_at", kwargs.get("fecha"))
                try:
                    values["reported_at"] = _parse_iso_datetime(provided_date)
                except ValueError:
                    return {"success": False, "error": "Invalid fecha/reported_at format"}

            if values:
                complaint.write(values)

            return {
                "success": True,
                "message": "Complaint updated successfully",
                "complaint_id": complaint.id,
                "complaint_number": complaint.name,
                "data": self._serialize_complaint(complaint),
            }

        except Exception as error:
            return {"success": False, "error": str(error)}
