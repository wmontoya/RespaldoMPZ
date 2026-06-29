/** @odoo-module */

import { Component, useState } from "@odoo/owl";
import { Layout } from "../layout/layout";

export class Dashboard extends Component {
  static template = "alumnos.Dashboard";
  static props = {};
  static components = { Layout };

  constructor() {
    super(...arguments);
    this.state = useState({
      itemIndex:0,
      responseDataPerson: null,
      responseDataPendientes:null // Almacena la información del resultado del request
    });
  }

  async fetchData() {
    try {
      const responsePerson = await fetch("https://www.perezzeledon.go.cr:9980/SPO_API.asmx/GET_PERSON?idNumber=3010045279");
      const dataPerson = await responsePerson.json();
      this.state.responseDataPerson = JSON.parse(dataPerson);

      const response = await fetch("https://www.perezzeledon.go.cr:9980/SPO_API.asmx/GET_PENDING?idNumber=3010045279");
      const data = await response.json();
      this.state.responseDataPendientes = data.data;
      console.log(data);
    } catch (error) {
      console.error("Error al obtener los datos:", error);
    }
  }
}