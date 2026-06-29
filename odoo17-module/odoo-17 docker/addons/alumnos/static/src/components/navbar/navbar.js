/** @odoo-module **/

import { Component } from "@odoo/owl";
import { useGlobalStore } from "../global_store";

export class Navbar extends Component {
  static template = "alumnos.Navbar";
  static props = {
    currentApp: String,
    apps: Array,
    selectApp: Function,
  };

  setup() {
    this.globalStore = useGlobalStore();
  }
}
