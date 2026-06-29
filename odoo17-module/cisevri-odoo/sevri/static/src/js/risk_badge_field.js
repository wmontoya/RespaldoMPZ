/** @odoo-module **/

import { Component, xml } from "@odoo/owl";
import { registry } from "@web/registry";
import { standardFieldProps } from "@web/views/fields/standard_field_props";

class RiskBadgeField extends Component {
    static props = {
        ...standardFieldProps,
    };

    get value() {
        return this.props.record.data[this.props.name];
    }

    get displayText() {
        const value = this.value;
        if (value === "low") return "Bajo";
        if (value === "medium") return "Medio";
        if (value === "high") return "Alto";
        return "";
    }

    get textClass() {
        const value = this.value;
        if (value === "low") return "text-success";
        if (value === "medium") return "text-warning";
        if (value === "high") return "text-danger";
        return "text-secondary";
    }
}

RiskBadgeField.template = xml`
    <span t-att-class="'fw-semibold ' + textClass">
        <t t-esc="displayText"/>
    </span>
`;

registry.category("fields").add("risk_badge", RiskBadgeField);
