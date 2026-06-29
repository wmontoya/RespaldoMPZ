# Guía de configuración para VS Code, Odoo 17

>**Notas:**

* Reemplaza `xxxxx` por la versión correspondiente o el nombre asignado a la carpeta.
* Configuración según Windows.

* Crea un nuevo perfil en VS Code para Python.
* Instala las siguientes dependencias para VS Code: Code Spell Checker, Markdownlint, Black Formatter, XML (Red Hat), Python Extension Pack. Además, se recomiendan las extensiones: Icons, Better Comments, Indent-Rainbow.

* Configura la carpeta `.vscode`. Debes seleccionar la versión que coincida con tu instalación de Odoo.
* `launch.json`:

    ```json
    {
    "version": "0.2.0",
    "configurations": [
        {
        "name": "Odoo 17",
        "type": "debugpy",
        "request": "launch",
        "program": "C:/Program Files/Odoo 17.0.xxxxx/server/odoo-bin",
        "args": ["--config=C:/Program Files/Odoo 17.0.xxxxx/server/odoo.conf"],
        "console": "internalConsole",
        "cwd": "C:/Program Files/Odoo 17.0.xxxxx/server",
        "justMyCode": true,
        "env": {
            "PYTHONUNBUFFERED": "1"
        }
        }
    ]
    }
    ```

* `settings.json`:

    ```json
    {
        // python
        "python.defaultInterpreterPath": "C:\\Program Files\\Odoo 17.0.xxxxx\\python\\python.exe",
        "python.analysis.extraPaths": [
            "C:\\Program Files\\Odoo 17.0.xxxxx\\server"
        ],
        // configuración de vs code
        "editor.formatOnSave": true,
        // configuración xml
        "xml.format.emptyElements": "collapse",
        "xml.format.preserveAttributeLineBreaks": true,
        "xml.fileAssociations": [
            {
                "pattern": "**/views.xml",
                "systemId": "https://www.odoo.com/xmlns/views.xsd"
            },
            {
                "pattern": "**/security.xml",
                "systemId": "https://www.odoo.com/xmlns/security.xsd"
            },
            {
                "pattern": "**/data.xml",
                "systemId": "https://www.odoo.com/xmlns/data.xsd"
            }
        ]
    }
    ```

De referencia los archivos que se recomienda usar en templates el [launch.json](../templates/launch.json) y [settings.json](../templates/settings.json)

## Preconfiguración de VS Code

Abre la paleta de comandos en VS Code (`Ctrl+Shift+P`).  
Busca y selecciona `Python: Select Interpreter`. Elige el intérprete que utiliza Odoo.  
Ubicación: `"C:\\Program Files\\Odoo 17.0.xxxxx\\python\\python.exe"`

## Para ejecutar el código

Si VS Code ya está configurado,  
ve a "Run and Debug" y ejecuta el código.
