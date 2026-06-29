from odoo.tests.common import TransactionCase, tagged
from datetime import date


@tagged("activity")
class TestCreateActivity(TransactionCase):
    def setUp(self):
        super().setUp()
        self.model = self.env["sev.activity"]
        self.department = self.env["hr.department"].create({"name": "Test Department"})

    def test_create_activity_no_events(self):
        activity = self.model.create(
            {
                "title": "Test Title",
                "subtitle": "Test Subtitle",
                "activity_date": date(2021, 1, 1),
                "dependency": "Test Dependency",
                "procedure_to_follow": "Test Procedure",
                "department_id": self.department.id,
            }
        )

        self.assertEqual(activity.title, "Test Title")
        self.assertEqual(activity.subtitle, "Test Subtitle")
        self.assertEqual(activity.activity_date, date(2021, 1, 1))
        self.assertEqual(activity.dependency, "Test Dependency")
        self.assertEqual(activity.procedure_to_follow, "Test Procedure")
        self.assertEqual(activity.department_id, self.department)
        self.assertCountEqual(activity.events, [])

    def test_create_activity_no_optional_fields(self):
        activity = self.model.create(
            {
                "title": "Test Title",
                "activity_date": date(2021, 1, 1),
                "department_id": self.department.id,
            }
        )
        self.assertEqual(activity.title, "Test Title")
        self.assertFalse(activity.subtitle)
        self.assertFalse(activity.dependency)
        self.assertFalse(activity.procedure_to_follow)
