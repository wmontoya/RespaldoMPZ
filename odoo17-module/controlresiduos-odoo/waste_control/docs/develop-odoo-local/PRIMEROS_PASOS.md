# Para iniciar el desarrollo del proyecto (Odoo)

- [Para iniciar el desarrollo del proyecto (Odoo)](#para-iniciar-el-desarrollo-del-proyecto-odoo)
  - [Instalaciones necesarias](#instalaciones-necesarias)
    - [Instalación y configuración](#instalación-y-configuración)
  - [Herramientas y scripts en la carpeta de tools](#herramientas-y-scripts-en-la-carpeta-de-tools)
  - [Para VS Code](#para-vs-code)
    - [Extensiones](#extensiones)
  - [Configuraciones](#configuraciones)
  - [Funcionamiento de Odoo](#funcionamiento-de-odoo)
  - [Utilidades para el proyecto](#utilidades-para-el-proyecto)

## Instalaciones necesarias

Proyecto:

- [Odoo 17](https://www.odoo.com/page/download)
- [Visual Studio Code](https://code.visualstudio.com/download) (opcional pero recomendado)
- PostgreSQL 12 or later (optional)

Utilidades:

- [Python 3.10 o superior](https://www.python.org/downloads/)
- [Node.js 22.14 o superior](https://nodejs.org/en/download/)

### Instalación y configuración

1. **Descarga e instala Odoo 17**:

    - InstalaOdoo desde el instalador descargado (<https://www.odoo.com/page/download>) incluye PostgreSQL, si ya tiene PostgreSQL instalado requiere una configuración manual.
    - Instala con la configuración predeterminada que incluye PostgreSQL

2. Clona el repositorio:

    Descargar manualmente o por comandos:

    ```bash
    git clone https://github.com/JuanCaUNA/waste_control.git
    cd waste_control
    ```

3. **Copia a la carpeta de addons de Odoo**:

    Para instalación local: run `cp -r waste_control /ruta/Odoo 17.0.x/server/addons`

    Para desarrollo se recomienda crear una carpeta llamada customs.
    Para desarrollo personalizado: run `cp -r waste_control /ruta/Odoo 17.0.x/server/customs/`

    incluir enOdoo.conf

    ```txt
    [options]
    addons_path = c:\program files\odoo 17.0.x\server\odoo\addons, c:\program files\odoo 17.0.x\server\customs
    ```

    Comentar o quitar la linea en el archivo deOdoo.conf para ver los log en el IDE en la consola de logs:

    ```txt
    logfile = C:\Program Files\Odoo 17.0.2\server\odoo.log
    ```

4. **Formateador**

    Para usar Black en tu proyecto, sigue estos pasos:

    - **Instala Black** (si no lo tienes):
        run `pip install black`

    - **Formatea tu proyecto** ejecutando el siguiente comando en la raíz de tu proyecto:
        run `black .`

5. **Dependencia de cspell**

    run `npm install -g cspell` Formateador de código
    run `npm install -g @cspell/dict-es-es` corrector ortográfico en español

    Desinstalar:
    run `npm uninstall -g cspell`
    run `npm uninstall -g @cspell/dict-es-es`

## Herramientas y scripts en la carpeta de tools

Incluye comandos para utilizar en el proyecto.
[Funciones adicionales en la carpeta de tools](tools/README.md)

## Para VS Code

### Extensiones

utilidades:

- Black Formatter
- Code Spell Checker
- EditorConfig for VS Code
- Markdown Command Runner

visual:

- better-comments
- icons
- indent-rainbow

## Configuraciones

**Configuración de Odoo**

Seguir los pasos en [Configuraciones para Odoo](guia-configuracion/GUIA_ODOO.md)

**Configuración de vs code**

Seguir los pasos en [Configuraciones para VS code](guia-configuracion/GUIA_VS_CODE.md)

De referencia los archivos que se recomienda usar en templates el [launch.json](templates/launch.json) y [settings.json](templates/settings.json)

## Funcionamiento de Odoo

Al momento de programar considerar algunas de las restricciones para Odoo 17

Puede ver algunas de reglas y explicaciones para Odoo en [Reglas deOdoo](./RULES_ODOO-17.md)

## Utilidades para el proyecto

En la carpeta de tools se almacena herramientas útiles para el proyecto y guía de configuración

[Indicaciones para las herramientas](../tools/README.md)
[Uso de herramientas](../tools/COMANDOS-PROYECTO.md)
