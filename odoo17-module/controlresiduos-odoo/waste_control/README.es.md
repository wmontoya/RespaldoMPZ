# Sistema de Gestión de Control de Residuos Odoo 17

[![Versión Odoo](https://img.shields.io/badge/Odoo-17.0-blue.svg)](https://github.com/odoo/odoo/tree/17.0)
[![Licencia: LGPL-3](https://img.shields.io/badge/Licencia-LGPL%20v3-blue.svg)](https://www.gnu.org/licenses/lgpl-3.0)
[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)

Un sistema integral de gestión y control de residuos y reciclaje para Odoo 17.

## 📋 Tabla de Contenidos

- [Sistema de Gestión de Control de Residuos Odoo 17](#sistema-de-gestión-de-control-de-residuos-odoo-17)
  - [📋 Tabla de Contenidos](#-tabla-de-contenidos)
  - [Descripción del proyecto](#descripción-del-proyecto)
  - [Clonar repositorio](#clonar-repositorio)
  - [Primeros pasos](#primeros-pasos)
  - [🛠️ Desarrollo](#️-desarrollo)
    - [Estructura del Proyecto](#estructura-del-proyecto)
  - [✨ Características](#-características)
    - [Funcionalidad Principal](#funcionalidad-principal)
    - [Características Avanzadas](#características-avanzadas)
    - [Características Técnicas](#características-técnicas)
  - [👥 Autores](#-autores)
  - [📄 Licencia](#-licencia)

## Descripción del proyecto

Es un módulo de gestión de proceso de recolección de basura desde el personal, vehículos, rutas, registros de basura y reportes.

Se gestiona los registros de forma controlada y automatizados. Se realiza seguimiento mediante auditoría y control de seguridad de quienes pueden ver, editar, borrar la información según varios roles que se pueden asignar a un usuario.

## Clonar repositorio

```bash
git clone https://github.com/JuanCaUNA/waste_control.git
cd waste_control
```

## Primeros pasos

Para iniciar a programar y algunos otros pasos extra revisa el siguiente archivo:

[PRIMEROS-PASOS](docs/PRIMEROS-PASOS.md)

Luego de configurado puede comenzar a utilizar algunos comandos útiles en:
[COMANDOS DEL PROYECTO](tools/COMANDOS-PROYECTO.md)

## 🛠️ Desarrollo

For development, please visit:
<http://localhost:8069/>

### Estructura del Proyecto

La estructura actual está definida en [ESTRUCTURA DEL PROYECTO](docs/PROJECT-STRUCTURE.txt)

## ✨ Características

### Funcionalidad Principal

- **Gestión de Registros de Residuos**: Rastrea diferentes tipos de residuos (en ruta, carne, orgánico, no reciclable)
- **Gestión de Vehículos y Rutas**: Monitoreo de rutas de vehículos, consumo de combustible y kilómetros recorridos
- **Gestión de Personal**: Administra conductores, supervisores y equipos de recolección
- **Gestión de Ubicaciones**: Sistema de ubicaciones jerárquico (provincias, cantones, distritos, comunidades)
- **Centros de Recolección**: Rastrea puntos de recolección e instalaciones de residuos

### Características Avanzadas

- **Seguimiento en Tiempo Real**: Monitoreo de actividades de recolección de residuos con marcas de tiempo
- **Sistema de Validación**: Validación avanzada de campos con reglas personalizadas
- **Soporte Multi-moneda**: Maneja diferentes monedas para datos financieros
- **Seguimiento de Actividades**: Registro de auditoría completo con integración de hilos de correo
- **Reportes Flexibles**: Informes y análisis completos
- **Seguridad Basada en Roles**: Control de acceso granular con múltiples roles de usuario

### Características Técnicas

- **Compatible con Odoo 17**: Construido específicamente para Odoo 17 con las últimas características
- **Integración de Hilos de Correo**: Soporte completo de chatter para comunicación
- **Widgets Avanzados**: UI moderna con experiencia de usuario mejorada
- **Validación de API**: Validación de datos robusta con mixins personalizados
- **Soporte Multi-edición**: Operaciones masivas para mayor eficiencia

## 👥 Autores

Este módulo fue desarrollado por:

- Juan C. Camacho Solano (GitHub: [JuanCaUNA](https://github.com/JuanCaUNA))
- Esteban Granados (GitHub: [Esteban Javier Granados Sibaja](https://github.com/EstebanJavierGranadosSibaja))

## 📄 Licencia

Este módulo está licenciado bajo la **Licencia LGPL-3.0**. Consulte el archivo [LICENSE](LICENSE) para más detalles.
