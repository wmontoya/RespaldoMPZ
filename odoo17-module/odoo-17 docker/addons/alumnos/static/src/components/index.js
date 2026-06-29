/* @odoo-module */

const { Component, whenReady, App, useState, onWillStart, useSubEnv } = owl
import { templates } from "@web/core/assets"
import { makeEnv, startServices } from "@web/env"
import { useService } from "@web/core/utils/hooks"
import { Dashboard } from "./dashboard/dashboard";
import { Contacts } from "./contacts/contacts";
import { GlobalStore } from "./global_store";
import { Navbar } from "./navbar/navbar"
class IndexComponent extends Component {
    static template = "alumnos.IndexComponent"
    static components = { Navbar }

    setup() {
        this.apps = [
            { id: "dashboard", name: "Dashboard", Component: Dashboard },
            { id: "contacts", name: "Contacts", Component: Contacts },
        ];
        this.state = useState({
            currentApp: this.apps[0],
        });
        const globalStore = useState(new GlobalStore());

        // add store to environment
        useSubEnv({ globalStore });

        // this.orm = useService("orm")

        onWillStart(async () => {
            // const data = await this.orm.searchRead("res.partner", [], ["name"], {
            //     limit: 10,
            //     order: "id desc",
            // })
            // //console.log(data)

            // this.state.partners = data
        })
    }

    selectApp(appId) {
        const newApp = this.apps.find((app) => app.id === appId);
        this.state.currentApp = newApp;
    }

}

whenReady(async () => {
    const env = makeEnv()
    await startServices(env)
    const owl_app = new App(IndexComponent, { templates, env })

    const owl_app_selector = document.querySelector('#owl_wrapwrap')
    if (owl_app_selector) {
        owl_app.mount(owl_app_selector)
    }
})
