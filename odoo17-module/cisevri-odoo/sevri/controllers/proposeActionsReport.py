from odoo import http
from odoo.http import Controller, request, Response
import json
import logging

_logger = logging.getLogger(__name__)

class ProposedActionController(http.Controller):
    @http.route('/api/v1/proposedAction/sevri/download_excel_report', type='http', auth='user', methods=['GET'], csrf=False)
    def download_proposed_action_report(self, **kwargs):
        try:
            actionsIDS = kwargs.get('actionsIDS', '')
            if not actionsIDS:
                return Response(
                    json.dumps({"error": "No actions selected."}),
                    content_type="application/json;charset=utf-8",
                    status=400, 
                )
            
            proposed_action_ids = [int(id) for id in actionsIDS.split(',') if id.isdigit()]

            try:
                report_service = request.env['report.sevri_follow'].sudo()
                result, content_type, filename = report_service.generate_excel_report(proposed_action_ids)
            except Exception as e:
                _logger.error("Error generating Excel report: %s", e)
                return Response(
                    json.dumps({"error": "Error generating Excel report."}),
                    content_type="application/json;charset=utf-8",
                    status=500,
                )

            return Response(
                result,
                headers={
                    'Content-Type': content_type,
                    'Content-Disposition': f'attachment; filename={filename}'
                },
                status=200,
            )

        except Exception as e:
            _logger.error("Unexpected error: %s", e)
            return Response(
                json.dumps({"error": "Unexpected error."}),
                content_type="application/json;charset=utf-8",
                status=500,
            )
            
            
            
class ProposedActionControllerPDF(http.Controller):
    @http.route('/api/v1/proposedAction/sevri/download_pdf_report', type='http', auth='user', methods=['GET'], csrf=False)
    def download_proposed_action_report(self, **kwargs):
        try:
            actionsIDS = kwargs.get('actionsIDS', '')
            if not actionsIDS:
                return Response(
                    json.dumps({"error": "No actions selected."}),
                    content_type="application/json;charset=utf-8",
                    status=400,  
                )
            
            proposed_action_ids = [int(id) for id in actionsIDS.split(',') if id.isdigit()]

            try:
                report_service = request.env['report.sevri_follow_pdf'].sudo()
                result, content_type, filename = report_service.generate_pdf_report(proposed_action_ids)
            except Exception as e:
                _logger.error("Error generating PDF report: %s", e)
                return Response(
                    json.dumps({"error": "Error generating PDF report."}),
                    content_type="application/json;charset=utf-8",
                    status=500,
                )

            return Response(
                result,
                headers={
                    'Content-Type': content_type,
                    'Content-Disposition': f'attachment; filename={filename}'
                },
                status=200,
            )

        except Exception as e:
            _logger.error("Unexpected error: %s", e)
            return Response(
                json.dumps({"error": "Unexpected error."}),
                content_type="application/json;charset=utf-8",
                status=500,
            )
