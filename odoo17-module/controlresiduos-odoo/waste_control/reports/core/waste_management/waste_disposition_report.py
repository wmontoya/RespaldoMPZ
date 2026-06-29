from odoo import models, api, _
from odoo.exceptions import UserError
from calendar import month_name, monthrange
from ...report_utils import get_report_date


class WasteDispositionReport(models.AbstractModel):
    _name = "report.waste_control.waste_disposition_report"
    _description = "Reporte de disposición de residuos"

    @api.model
    def _get_report_values(self, docids, data=None):
        wizard = self.env["waste_control.waste_disposition_wizard"].browse(docids)
        wizard.ensure_one()

        year = wizard.year

        start_date = f"{year}-01-01"
        end_date = f"{year}-12-31"

        # 1. Fetch Waste Data
        # Group by Month and Type
        waste_data = self.env["waste_control.waste"].read_group(
            [("date", ">=", start_date), ("date", "<=", end_date)],
            ["tons", "date", "types_of_waste_id"],
            ["date:month", "types_of_waste_id"],
            lazy=False,
        )

        # Get all waste types to build columns
        waste_types = self.env["waste_control.types_of_waste"].search([])
        type_map = {t.id: t.name for t in waste_types}
        sorted_types = sorted(waste_types, key=lambda x: x.name)
        type_ids = [t.id for t in sorted_types]

        # 2. Fetch EBI Data
        ebi_data = self.env["waste_control.purchase_orders_ebi"].read_group(
            [("date", ">=", start_date), ("date", "<=", end_date)],
            ["tonnages", "cost", "date"],
            ["date:month"],
        )
        ebi_by_month = {
            m["date:month"]: {"tons": m["tonnages"], "cost": m["cost"]}
            for m in ebi_data
        }

        # 3. Organize Data by Month
        months_data = []

        # Pre-fill structure
        monthly_waste = {
            month_name[i]: {tid: 0.0 for tid in type_ids} for i in range(1, 13)
        }
        monthly_totals = {month_name[i]: 0.0 for i in range(1, 13)}  # Internal totals

        for rec in waste_data:
            # rec['date:month'] is like "January 2023" depending on locale.
            # But wait, read_group returns localized strings.
            # Safest is to map them or trust the order if I iterate 1..12 and filter?
            # read_group return value for date:month is "Month year".
            # Checking locale is risky.

            # Alternative: Search raw and process in python.
            pass

        # Let's do raw search for safety regarding month names
        all_waste = self.env["waste_control.waste"].search(
            [("date", ">=", start_date), ("date", "<=", end_date)]
        )

        # Reset structure for loop
        rows = []

        # Annual Totals
        annual_type_totals = {tid: 0.0 for tid in type_ids}
        annual_ebi_tons = 0.0
        annual_ebi_cost = 0.0
        annual_total_tons = 0.0
        annual_savings = 0.0

        # Get Tariff for the year
        tariff_obj = self.env["waste_control.ebi_tariffs"].search(
            [("year", "=", year)], limit=1
        )
        official_tariff = tariff_obj.tariff if tariff_obj else 0.0

        for i in range(1, 13):
            m_name = month_name[i]

            # Filter in memory (O(N) is fine for N < 10000)
            m_waste = all_waste.filtered(lambda w: w.date.month == i)

            row = {"month": m_name, "types": {}, "total_internal": 0.0}

            # Internal Waste breakdown
            for tid in type_ids:
                type_tons = sum(
                    w.tons for w in m_waste if w.types_of_waste_id.id == tid
                )
                row["types"][tid] = type_tons
                row["total_internal"] += type_tons
                annual_type_totals[tid] += type_tons

            annual_total_tons += row["total_internal"]

            # EBI Data
            # Let's fix date range properly

            last_day = monthrange(int(year), i)[1]
            m_start = f"{year}-{i:02d}-01"
            m_end = f"{year}-{i:02d}-{last_day}"

            m_ebi_recs = self.env["waste_control.purchase_orders_ebi"].search(
                [("date", ">=", m_start), ("date", "<=", m_end)]
            )

            check_tons = sum(r.tonnages for r in m_ebi_recs)
            check_cost = sum(r.cost for r in m_ebi_recs)

            row["ebi_tons"] = check_tons
            row["ebi_cost"] = check_cost
            row["total_waste"] = (
                row["total_internal"] + check_tons
            )  # Is EBI included in Internal?
            # "Disposición Final" implies Internal is what we collected and processed/recycled?
            # Or is EBI the "No Valorizable" part of Internal?
            # In `waste_control.waste`, we have types. One type is likely "No Reciclable" or similar.
            # If `purchase_orders_ebi` is just the INVOICE for the landfill, it corresponds to the tons of "No Reciclable".
            # If we sum them, we double count?
            # The prompt says: "Costos de transferencia (actual EBI y sin separar)".
            # Usually strict report: Columns for each type + Total.
            # If EBI tons match "" type tons, we shouldn't add them to Total.
            # Let's assume EBI Tons is redundant to "" Type but Cost is unique.
            # I will carry EBI Tons but for Total Waste I will use the sum of Internal Types.

            # RE-CHECK: Does `waste_control.waste` contain "Basura" / "Ordinario"?
            # If yes, `ebi_tons` ~ `sum(waste where type=Ordinario)`.
            # I will trust `ebi_tons` from the invoice for the Cost calculation.
            # For the "Tons Breakdown", I trust `waste_control.waste`.

            row["total_tons_displayed"] = row["total_internal"]  # Sum of all types

            # Calc Cost Analysis
            # Cost per Ton = EBI Cost / EBI Tons (or Official Tariff)
            # Theoretical Cost = Total Tons * Cost per Ton
            # Savings = Theoretical - Real

            cost_per_ton = 0.0
            if official_tariff:
                cost_per_ton = official_tariff
            elif check_tons > 0:
                cost_per_ton = check_cost / check_tons

            theoretical_cost = row["total_tons_displayed"] * cost_per_ton
            savings = theoretical_cost - check_cost

            row["cost_per_ton"] = cost_per_ton
            row["theoretical_cost"] = theoretical_cost
            row["savings"] = savings

            annual_ebi_tons += check_tons
            annual_ebi_cost += check_cost
            annual_savings += savings

            rows.append(row)

        return {
            "doc_ids": docids,
            "doc_model": "waste_control.waste_disposition_wizard",
            "data": data,
            "year": year,
            "months_data": rows,
            "waste_types": sorted_types,
            "annual_type_totals": annual_type_totals,
            "annual_total_tons": annual_total_tons,
            "annual_ebi_tons": annual_ebi_tons,
            "annual_ebi_cost": annual_ebi_cost,
            "annual_savings": annual_savings,
            "report_date": get_report_date(),
        }
