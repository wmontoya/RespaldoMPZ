# Guía de Inicio Rápido (Windows), Odoo 17

>**Nota:** Reemplaza `xxxxx` por la versión correspondiente o el nombre asignado a la carpeta.

## 1. Desactivar los servicios de Odoo

- Detén los servicios de Odoo (Odoo-server-17).
- Configura el servicio en modo **Deshabilitado** o **Manual**.

## 2. Cambiar permisos de la carpeta de Odoo

1. Ve a la carpeta de Odoo.
2. Haz clic derecho y selecciona **Propiedades**.
3. Ve a la pestaña **Seguridad**.
4. Haz clic en **Editar**.
5. Selecciona tu perfil de usuario y habilita **todos los permisos**.
6. Aplica los cambios y espera a que finalice. Guarda.

## 3. Mover el proyecto

- Mueve el proyecto a la carpeta `addons` o a otra carpeta nueva.
- Si usas una carpeta distinta a `addons`, agrégala en la configuración:
  - Edita el archivo de configuración en `Odoo 17.0.xxxxx\server\odoo.conf`

    ```txt
    addons_path = c:\program files\odoo 17.0.xxxxx\server\odoo\addons, c:\program files\odoo 17.0.xxxxx\server\customs
    ```

## 4. Habilitar lectura de logs

- Comenta la línea del archivo de configuración para activar la lectura de logs:

    ```txt
    # logfile = C:\Program Files\Odoo 17.0.xxxxx\server\odoo-server.log
    ```

## 5. Primer inicio de Odoo

Al iniciar Odoo ya sea mediante el servicios o depuración en vs code se realiza en: <http://localhost:8069/>

- Al iniciar Odoo por primera vez, completa los campos con tus datos preferidos.
- **Importante:** Selecciona el país y el idioma correspondiente.

## 6. Datos de demostración

- Los datos demo permiten probar datos de ejemplo definidos para el módulo de Odoo y los existentes.

## 7. Activar modo desarrollador

- Descarga la extensión de depuración de Odoo para habilitar el modo desarrollador.
- Actualiza la lista de aplicaciones.
- Cada vez que realices cambios en un módulo, actualiza ese mismo módulo.

## 8. Configuración de roles

Para los roles se debe de ir a configuraciones y asignar los roles con los permisos para que la aplicación sea visible al usuario asi como registrar los usuarios.
