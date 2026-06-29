import os
import sys
from typing import List

# Variables globales
OUTPUT_FILE = "docs/PROJECT-STRUCTURE.txt"
INITIAL_PATTERNS = [".git/"]


def process_gitignore_line(line: str) -> str:
    """Procesa una línea del .gitignore y la normaliza para los patrones."""
    # Elimina espacios y saltos de línea
    line = line.strip()
    # Ignora comentarios y líneas vacías
    if not line or line.startswith("#"):
        return ""
    # Normaliza los separadores de carpeta
    line = line.replace("\\", "/")
    return line


def load_local_gitignore_patterns(directory_path: str) -> List[str]:
    """Carga los patrones del .gitignore en el directorio actual (no recursivo)."""
    patterns = []
    gitignore_path = os.path.join(directory_path, ".gitignore")

    if os.path.exists(gitignore_path):
        with open(gitignore_path, "r", encoding="utf-8") as f:
            for line in f:
                pattern = process_gitignore_line(line)
                if pattern:
                    patterns.append(pattern)

    return patterns


def has_ignore_all_pattern(directory_path: str) -> bool:
    """Verifica si un directorio tiene un .gitignore con el patrón '*' (ignorar todo)."""
    gitignore_path = os.path.join(directory_path, ".gitignore")

    if os.path.exists(gitignore_path):
        try:
            with open(gitignore_path, "r", encoding="utf-8") as f:
                for line in f:
                    pattern = process_gitignore_line(line)
                    if pattern == "*":
                        return True
        except (PermissionError, OSError):
            pass

    return False


def should_ignore(item_name: str, is_directory: bool, patterns: List[str]) -> bool:
    """Verifica si un item debe ser ignorado según los patrones del .gitignore.

    Args:
        item_name: Nombre del archivo o carpeta
        is_directory: Si es un directorio
        patterns: Lista de patrones del .gitignore (del directorio actual y heredados)
    """
    from fnmatch import fnmatch

    for pattern in patterns:
        # Si el patrón es solo *, ignorar todo
        if pattern == "*":
            return True

        # Detectar si el patrón es específico para carpetas (termina con /)
        is_folder_pattern = pattern.endswith("/")
        if is_folder_pattern:
            # Solo aplicar a directorios
            if not is_directory:
                continue
            # Remover la barra final para comparar
            pattern = pattern.rstrip("/")

        # Patrones que empiezan con / son relativos a la raíz del .gitignore que los define
        if pattern.startswith("/"):
            clean_pattern = pattern.lstrip("/")
            if item_name == clean_pattern:
                return True
        # Patrones sin / al inicio se aplican en cualquier nivel
        else:
            # Patrones con comodines
            if "*" in pattern or "?" in pattern:
                if fnmatch(item_name, pattern):
                    return True
            # Coincidencia exacta
            elif item_name == pattern:
                return True

    return False


def get_project_structure(
    current_path: str,
    output_file: str,
    prefix: str = "",
    inherited_patterns: List[str] = [],
):
    """Genera la estructura del proyecto en formato de árbol recursivamente.

    Args:
        current_path: Ruta del directorio actual a procesar
        output_file: Archivo donde escribir la estructura
        prefix: Prefijo para la indentación del árbol
        inherited_patterns: Patrones heredados de .gitignore de niveles superiores
    """
    if inherited_patterns is None:
        inherited_patterns = []

    # Cargar patrones locales del .gitignore en este directorio
    local_patterns = load_local_gitignore_patterns(current_path)

    # Combinar patrones heredados con los locales
    current_patterns = inherited_patterns + local_patterns

    try:
        items = sorted(
            os.listdir(current_path),
            key=lambda x: (not os.path.isdir(os.path.join(current_path, x)), x.lower()),
        )
    except PermissionError:
        return

    # Filtrar items ignorados
    filtered_items = []
    for item in items:
        item_path = os.path.join(current_path, item)
        is_directory = os.path.isdir(item_path)

        # Si es un directorio, verificar si tiene un .gitignore con '*' (ignorar todo)
        if is_directory and has_ignore_all_pattern(item_path):
            continue  # Ignorar este directorio completo

        # Verificar si debe ser ignorado usando solo el nombre del item
        if not should_ignore(item, is_directory, current_patterns):
            filtered_items.append((item, is_directory))

    # Separar carpetas y archivos
    folders = [(name, is_dir) for name, is_dir in filtered_items if is_dir]
    files = [(name, is_dir) for name, is_dir in filtered_items if not is_dir]

    # Escribir archivos primero
    if files:
        with open(output_file, "a", encoding="utf-8") as f:
            for file_name, _ in files:
                f.write(f"{prefix}|   {file_name}\n")
            # Línea vacía después de archivos si hay carpetas
            if folders:
                f.write(f"{prefix}|   \n")
    elif folders:
        # Si solo hay carpetas (sin archivos), agregar línea vacía
        with open(output_file, "a", encoding="utf-8") as f:
            f.write(f"{prefix}|   \n")

    # Procesar carpetas
    folder_count = len(folders)
    for index, (folder_name, _) in enumerate(folders):
        is_last = index == folder_count - 1
        item_path = os.path.join(current_path, folder_name)

        # Determinar el conector
        if is_last:
            connector = "\\---"
            new_prefix = f"{prefix}    "
        else:
            connector = "+---"
            new_prefix = f"{prefix}|   "

        # Escribir la carpeta
        with open(output_file, "a", encoding="utf-8") as f:
            f.write(f"{prefix}{connector}{folder_name}\n")

        # Procesar contenido recursivamente
        try:
            # Pasar los patrones actuales (heredados + locales) al siguiente nivel
            get_project_structure(item_path, output_file, new_prefix, current_patterns)

            # Agregar línea vacía después del contenido si no es la última carpeta
            if not is_last:
                with open(output_file, "a", encoding="utf-8") as f:
                    f.write(f"{prefix}|   \n")
        except (PermissionError, OSError):
            pass


def main(project_path):
    """Función principal."""
    # Recibir la ruta del proyecto del usuario
    if not project_path:
        project_path = input("Ingrese la ruta del proyecto: ").strip()

    if not os.path.exists(project_path):
        print("La ruta del proyecto proporcionada no existe.")
        return

    project_root = os.path.abspath(project_path)
    output_file_path = os.path.join(project_root, OUTPUT_FILE)

    # Crear carpeta docs si no existe
    output_dir = os.path.dirname(output_file_path)
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)

    # Limpiar archivo de salida si existe
    if os.path.exists(output_file_path):
        os.remove(output_file_path)

    # Escribir el nombre del proyecto raíz
    project_name = os.path.basename(project_root)
    with open(output_file_path, "w", encoding="utf-8") as f:
        f.write(f"{project_name}\n")

    # Generar estructura del proyecto (los patrones se cargarán jerárquicamente)
    get_project_structure(project_root, output_file_path, "", INITIAL_PATTERNS)

    print("Estructura del proyecto guardado la carpeta docs")


if __name__ == "__main__":
    project_path = sys.argv[1] if len(sys.argv) > 1 else ""
    main(project_path)
