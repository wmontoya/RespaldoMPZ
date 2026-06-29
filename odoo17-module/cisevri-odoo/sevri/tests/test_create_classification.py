from odoo.tests.common import TransactionCase, tagged


@tagged("classification")
class TestCreateClassification(TransactionCase):
    def setUp(self):
        super().setUp()

        self.classification_model = self.env["sev.classification"]

    def test_create_classification(self):
        classification = self.classification_model.create(
            {
                "description": "Test Classification",
                "event_type_id": self.env["sev.event_type"]
                .create({"name": "Test Type"})
                .id,
            }
        )

        self.assertEqual(classification.description, "Test Classification")
        self.assertTrue(classification.event_type_id)
        self.assertFalse(classification.events)
        self.assertFalse(classification.specifications)
