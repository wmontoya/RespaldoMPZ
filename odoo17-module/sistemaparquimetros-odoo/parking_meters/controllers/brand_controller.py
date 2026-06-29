from odoo import http
from odoo.http import request


class BrandController(http.Controller):

    @http.route("/api/v1/parking_meters/brands", type="json", auth="user", methods=["POST"], csrf=False)
    def brands(self):
        try:
            request.env.cr.execute("""
                SELECT brand_code_id, COUNT(*) as usage_count
                FROM parking_meters_infraction
                WHERE brand_code_id IS NOT NULL
                GROUP BY brand_code_id
                ORDER BY usage_count DESC
                LIMIT 10
            """)
            top_brands_data = request.env.cr.fetchall()
            top_brand_ids = [row[0] for row in top_brands_data]
            usage_dict = dict(top_brands_data)

            all_brands = request.env["parking_meters.brand"].sudo().search([])

            top_brands = []
            other_brands = []

            for brand in all_brands:
                brand_info = {
                    "id": brand.id,
                    "brand": brand.brand,
                    "usage_count": usage_dict.get(brand.id, 0)
                }
                if brand.id in top_brand_ids:
                    top_brands.append(brand_info)
                else:
                    other_brands.append(brand_info)

            top_brands.sort(key=lambda x: x["usage_count"], reverse=True)
            other_brands.sort(key=lambda x: x["brand"])
            brand_list = top_brands + other_brands

            return {
                "success": True,
                "message": "Lista completa de Marcas",
                "data": brand_list
            }

        except Exception as e:
            return {
                "success": False,
                "message": "Error al procesar la solicitud.",
                "error": str(e)
            }
