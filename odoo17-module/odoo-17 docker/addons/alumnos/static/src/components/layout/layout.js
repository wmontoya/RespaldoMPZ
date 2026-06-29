/** @odoo-module */

import { Component } from "@odoo/owl";

export class Layout extends Component {
  static template = "alumnos.Layout";
  static props = {
    slots: Object,
    contentClass: { type: String, optional: true },
  };
}
