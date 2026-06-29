from odoo.tests.common import TransactionCase, tagged


@tagged("event_type")
class TestCreateEventType(TransactionCase):
    def setUp(self):
        super().setUp()

        self.event_type_model = self.env["sev.event_type"]

    def test_create_event_type(self):
        vals = {"name": "Test Event Type", "description": "Test Description"}
        event_type = self.event_type_model.create(vals)

        self.assertEqual(event_type.name, "Test Event Type")
        self.assertEqual(event_type.description, "Test Description")
