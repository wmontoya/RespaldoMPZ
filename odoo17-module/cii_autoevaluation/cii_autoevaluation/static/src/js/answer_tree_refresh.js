/** @odoo-module **/

import { ListController } from "@web/views/list/list_controller";
import { patch } from "@web/core/utils/patch";

patch(ListController.prototype, {
    /**
     * Override to refresh the tree view when a field changes in editable mode
     */
    async onCellChanged(record, fieldName) {
        const result = await super.onCellChanged(...arguments);

        // If the response field changed in ae.answer model, force a reload
        if (this.props.resModel === "ae.answer" && fieldName === "response") {
            // Small delay to allow the write operation to complete
            setTimeout(() => {
                this.model.root.load();
            }, 300);
        }

        return result;
    },
});
