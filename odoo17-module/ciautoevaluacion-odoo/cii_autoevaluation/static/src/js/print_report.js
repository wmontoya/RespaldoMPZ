/** @odoo-module **/

import { registry } from "@web/core/registry";
import { browser } from "@web/core/browser/browser";

const printReportService = {
    dependencies: [],
    start() {
        return {
            printReport(title) {
                // Simple print functionality
                browser.print();
            }
        };
    }
};

registry.category("services").add("print_report", printReportService);

// Client action for printing
const printReportAction = {
    type: "ir.actions.client",
    tag: "print_report",
    params: {
        title: "",
    },
};

export { printReportAction }; 