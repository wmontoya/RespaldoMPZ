from datetime import datetime
from odoo.tests.common import TransactionCase, tagged


@tagged("specification")
class TestSpecification(TransactionCase):
    def setUp(self):
        super().setUp()

        self.event_model = self.env["sev.event"]
        self.activity_model = self.env["sev.activity"]
        self.event_type_model = self.env["sev.event_type"]
        self.classification_model = self.env["sev.classification"]
        self.specification_model = self.env["sev.specification"]

        self.activity = self.activity_model.create(
            {
                "title": "Test Activity",
                "activity_date": datetime.now().date(),
            }
        )

        self.event_type = self.event_type_model.create({"name": "Test Event Type"})

        self.classification = self.classification_model.create(
            {"description": "Test Classification"}
        )

        self.specification = self.specification_model.create(
            {"description": "Test Specification"}
        )

    def _create_test_event(self, **kwargs):
        """Helper method to create test events"""
        default_values = {
            "activity_id": self.activity.id,
            "description": "Test Description",
            "event_type_id": self.event_type.id,
            "event_classification_id": self.classification.id,
            "event_specification_id": self.specification.id,
            "probability": 5,
            "impact": 3,
            "risk_level": "medium",
            "actitude": "positive",
            "aptitude": "positive",
            "status": "active",
        }
        default_values.update(kwargs)
        return self.event_model.create(default_values)

    def test_create_specification(self):
        """Test specification creation with event field"""
        event = self._create_test_event()

        self.assertEqual(event.activity_id, self.activity)
        self.assertEqual(event.description, "Test Description")
        self.assertEqual(event.probability, 5)
        self.assertEqual(event.impact, 3)
        self.assertEqual(event.risk_level, "medium")
