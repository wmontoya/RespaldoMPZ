from odoo import models

MONTH_SELECTION = [
    ("1", "Enero"),
    ("2", "Febrero"),
    ("3", "Marzo"),
    ("4", "Abril"),
    ("5", "Mayo"),
    ("6", "Junio"),
    ("7", "Julio"),
    ("8", "Agosto"),
    ("9", "Septiembre"),
    ("10", "Octubre"),
    ("11", "Noviembre"),
    ("12", "Diciembre"),
]

DAYS_SELECTION = [
    ("1", "Lunes"),
    ("2", "Martes"),
    ("3", "Miércoles"),
    ("4", "Jueves"),
    ("5", "Viernes"),
    ("6", "Sábado"),
    ("7", "Domingo"),
]


class Utils(models.AbstractModel):
    _name = "waste_control.utils"
    _description = "Funciones de utilidad para el control de residuos"

    def get_month_name(self, month_number):
        """
        Returns the name of the month for a given month number.
        """
        return MONTH_SELECTION[month_number - 1][1]
