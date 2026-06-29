# Waste Control Management System Odoo 17

[![Odoo Version](https://img.shields.io/badge/Odoo-17.0-blue.svg)](https://github.com/odoo/odoo/tree/17.0)
[![License: LGPL-3](https://img.shields.io/badge/License-LGPL%20v3-blue.svg)](https://www.gnu.org/licenses/lgpl-3.0)
[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)

A comprehensive waste management and recycling control system for Odoo 17.

## 📋 Table of Contents

- [Waste Control Management System Odoo 17](#waste-control-management-system-odoo-17)
  - [📋 Table of Contents](#-table-of-contents)
  - [Project Description](#project-description)
  - [Clone Repository](#clone-repository)
  - [Getting Started](#getting-started)
  - [🛠️ Development](#️-development)
    - [Project Structure](#project-structure)
  - [✨ Features](#-features)
    - [Core Functionality](#core-functionality)
    - [Advanced Features](#advanced-features)
    - [Technical Features](#technical-features)
  - [👥 Authors](#-authors)
  - [📄 License](#-license)

## Project Description

This is a waste collection management module that handles personnel, vehicles, routes, waste records, and reports.

It manages records in a controlled and automated way. It provides tracking through auditing and security controls that determine who can view, edit, or delete information based on various roles that can be assigned to users.

## Clone Repository

```bash
git clone https://github.com/JuanCaUNA/waste_control.git
cd waste_control
```

## Getting Started

To start programming and for additional steps, check the following file:

[GETTING STARTED](docs/PRIMEROS-PASOS.md)

After configuration, you can start using some useful commands at:
[PROJECT COMMANDS](tools/COMANDOS-PROYECTO.md)

## 🛠️ Development

Para el desarrollo visitar:
<http://localhost:8069/>

### Project Structure

La estructura actual esta definida en [PROJECT-STRUCTURE](docs/PROJECT-STRUCTURE.txt)

## ✨ Features

### Core Functionality

- **Waste Records Management**: Track different types of waste (on-route, meat, organic, non-recyclable)
- **Vehicle & Route Management**: Monitor vehicle routes, fuel consumption, and kilometers traveled
- **Staff Management**: Manage drivers, supervisors, and collection teams
- **Location Management**: Hierarchical location system (provinces, cantons, districts, communities)
- **Collection Centers**: Track waste collection points and facilities

### Advanced Features

- **Real-time Tracking**: Monitor waste collection activities with timestamps
- **Validation System**: Advanced field validation with custom rules
- **Multi-currency Support**: Handle different currencies for financial data
- **Activity Tracking**: Full audit trail with mail thread integration
- **Flexible Reporting**: Comprehensive reporting and analytics
- **Role-based Security**: Granular access control with multiple user roles

### Technical Features

- **Odoo 17 Compatible**: Built specifically for Odoo 17 with latest features
- **Mail Thread Integration**: Full chatter support for communication
- **Advanced Widgets**: Modern UI with enhanced user experience
- **API Validation**: Robust data validation with custom mixins
- **Multi-edit Support**: Bulk operations for improved efficiency

## 👥 Authors

This module was developed by:

- Juan C. Camacho Solano (GitHub: [JuanCaUNA](https://github.com/JuanCaUNA))
- Esteban Granados (GitHub: [Esteban Javier Granados Sibaja](https://github.com/EstebanJavierGranadosSibaja))

## 📄 License

This module is licensed under the **LGPL-3.0 License**. See the [LICENSE](LICENSE) file for more details.
