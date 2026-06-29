import json
import logging
from odoo.http import request

from datetime import date, datetime
from ..services.activity_service import ActivityService


_logger = logging.getLogger(__name__)

def date_to_string(value):
    if not value:
        return None
    if isinstance(value, (date, datetime)):
        return value.strftime("%Y-%m-%d")
    return str(value)

class SevriProcessService:
    @staticmethod
    def compare_dates(sevri_processes, current_date):
        sevri_processes_res = SevriProcessService.parse_sevri_processes(sevri_processes)
        for sevri_process in sevri_processes_res:
            initial_date = datetime.strptime(
                sevri_process["initial_date"], "%Y-%m-%d"
            ).date()
            final_date = datetime.strptime(sevri_process["final_date"], "%Y-%m-%d").date()
            if (
                initial_date <= current_date
                and final_date >= current_date
                and sevri_process["status"] == "active"
            ):
                return sevri_process
        return None

    @staticmethod
    def parse_sevri_processes(sevri_processes):
        return [
            SevriProcessService._parse_single_sevri_process(sevri_process)
            for sevri_process in sevri_processes
        ]

    @staticmethod
    def _parse_single_sevri_process(sevri_process):
        return {
            "id": sevri_process.id,
            "activities": [
                ActivityService._format_activity(activity)
                for activity in sevri_process.activities
            ],
            "initial_date": date_to_string(sevri_process.initial_date),
            "final_date": date_to_string(sevri_process.final_date),
            "status": sevri_process.status,
        }

    @staticmethod
    def get_sevri_processes(**kwargs):
        sevri_processes = request.env["sev.process"].sudo().search([])
        _logger.info("Sevri Processes: %s", sevri_processes)

        if sevri_processes:
            return [SevriProcessService._parse_single_sevri_process(process) for process in sevri_processes]
        return None

    @staticmethod
    def post_sevri_process(**kwargs):
        sevri_process = request.env["sev.process"].sudo().create(kwargs)
        return SevriProcessService._parse_single_sevri_process(sevri_process)

    @staticmethod
    def update_sevri_process(sevri_process_id, data):
        sevri_process = request.env["sev.process"].sudo().browse(sevri_process_id)
        if not sevri_process.exists():
            _logger.error("Sevri process with ID %s does not exist", sevri_process_id)
            raise ValueError(f"Sevri process with ID {sevri_process_id} does not exist")

        _logger.info("Sevri process: %s", data)
        _logger.info("Updating sevri process with ID %s", SevriProcessService._parse_single_sevri_process(sevri_process))
        sevri_process.write(data)
        return SevriProcessService._parse_single_sevri_process(sevri_process)

    @staticmethod
    def delete_sevri_process(sevri_process_id):
        sevri_process = request.env["sev.process"].sudo().browse(sevri_process_id)
        if not sevri_process:
            return None

        sevri_process.unlink()
        return SevriProcessService._parse_single_sevri_process(sevri_process)

    @staticmethod
    def get_sevri_process(sevri_process_id, **kwargs):
        sevri_process = request.env["sev.process"].sudo().browse(sevri_process_id)
        if sevri_process:
            return SevriProcessService._parse_single_sevri_process(sevri_process)
        return None
