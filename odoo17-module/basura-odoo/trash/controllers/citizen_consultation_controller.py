# -*- coding: utf-8 -*-
from odoo import http


CITIZENS_DATA = {
    "1-2345-6789": {
        "cedula": "1-2345-6789",
        "nombre": "Juan Pérez Rodríguez",
        "propiedades": [
            {
                "direccion": "Barrio Luján, Casa #45, San Isidro del General",
                "zona": "Zona Residencial A",
                "tarifa": 12500,
                "unidadesHabitacionales": 1,
                "periodosPendientes": [
                    {
                        "periodo": "Trimestre I-2025",
                        "fechaCorte": "31 de marzo, 2025",
                        "monto": 12500,
                    },
                    {
                        "periodo": "Trimestre IV-2024",
                        "fechaCorte": "31 de diciembre, 2024",
                        "monto": 11800,
                    },
                ],
            },
            {
                "direccion": "Centro, Edificio Plaza, Local 5, San Isidro del General",
                "zona": "Zona Comercial",
                "tarifa": 25000,
                "unidadesHabitacionales": 1,
                "periodosPendientes": [
                    {
                        "periodo": "Trimestre I-2025",
                        "fechaCorte": "31 de marzo, 2025",
                        "monto": 25000,
                    },
                ],
            },
        ],
    },
    "2-3456-7890": {
        "cedula": "2-3456-7890",
        "nombre": "María González Castro",
        "propiedades": [
            {
                "direccion": "Los Ángeles, Apartamento 3B, San Isidro del General",
                "zona": "Zona Residencial B",
                "tarifa": 18000,
                "unidadesHabitacionales": 3,
                "periodosPendientes": [],
            },
        ],
    },
    "3-4567-8901": {
        "cedula": "3-4567-8901",
        "nombre": "Carlos Ramírez Mora",
        "propiedades": [
            {
                "direccion": "Centro, Casa #102, San Isidro del General",
                "zona": "Zona Residencial A",
                "tarifa": 15000,
                "unidadesHabitacionales": 2,
                "periodosPendientes": [
                    {
                        "periodo": "Trimestre I-2025",
                        "fechaCorte": "31 de marzo, 2025",
                        "monto": 15000,
                    },
                ],
            },
        ],
    },
}


class CitizenConsultationController(http.Controller):

    @staticmethod
    def _build_response(id_number=None):
        if not id_number:
            return CITIZENS_DATA

        if id_number not in CITIZENS_DATA:
            return {}

        return {id_number: CITIZENS_DATA[id_number]}

    @http.route(
        "/api/v1/trash/consultation",
        type="json",
        auth="public",
        methods=["GET", "POST"],
        csrf=False,
    )
    def get_citizens_data(self, **kwargs):
        """
        Return static citizen consultation data.
        - Without parameters: returns the full Record<string, any> payload.
        - With `cedula` or `id_number`: returns only that citizen keyed by ID number.
        """
        id_number = kwargs.get("cedula") or kwargs.get("id_number")

        return self._build_response(id_number=id_number)

    @http.route(
        "/api/v1/trash/consultation/<string:id_number>",
        type="json",
        auth="public",
        methods=["GET", "POST"],
        csrf=False,
    )
    def get_citizen_data_by_id_number(self, id_number, **kwargs):
        """
        Return static consultation data for a single citizen by path parameter.
        """
        return self._build_response(id_number=id_number)
