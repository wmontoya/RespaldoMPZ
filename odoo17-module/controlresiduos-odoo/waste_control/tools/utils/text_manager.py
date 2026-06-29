# File dir standar start from project root "./":
# ** For execute run with: python -m tools.utils.text_manager
from .templates import get_template, xml_head, xml_end


def write_on_file(file_dir: str, content: str) -> None:
    try:
        with open(file_dir, "w", encoding="utf-8") as f:
            f.write(content)
    except Exception as e:
        print("Fallo escritura:", e)
        raise


def delete_file_content(file_dir: str) -> None:
    try:
        open(file_dir, "w").close()
    except Exception as e:
        print("Fallo limpieza:", e)
        raise


def get_file_content(file_dir: str) -> list[str]:
    try:
        with open(file_dir, "r", encoding="utf-8") as f:
            return f.readlines()
    except Exception as e:
        print("Fallo lectura:", e)
        raise


def lines_text_extractor():
    file_dir = "./tools/utils/"
    content_file = get_file_content(file_dir)
    new_content = []
    start = 0  # ""
    end_text = ""
    end = 0
    txt = ""

    for line in content_file:
        txt = ""
        if line:
            end = line.find(end_text, start)
            if end != -1:
                txt = line[start:end]
        new_content.append(txt)

    write_on_file(file_dir, "\n".join(new_content))

    print("Se completo las extraccion")


def generate_access_file():
    content_file = []
    content_file.append(
        "id,name,model_id:id,group_id:id,perm_read,perm_write,perm_create,perm_unlink"
    )

    entities_list = get_file_content("./tools/utils/entities.txt")
    report_list = get_file_content("./tools/utils/reports.txt")

    perm_entities = [
        # (role) - (perm_read,perm_write,perm_create,perm_unlink)
        ("auditor", "1,0,0,0"),
        ("editor", "1,1,0,0"),
        ("it", "1,1,1,1"),
        ("leadership", "1,0,0,0"),
        ("technical", "1,1,1,1"),
        # ("admin", "1,1,1,1"),  # Rol temporal
    ]

    perm_reports = [
        # (role) - (perm_read,perm_write,perm_create,perm_unlink)
        ("auditor", "1,1,1,1"),
        ("editor", "1,1,1,1"),
        ("it", "1,1,1,1"),
        ("leadership", "1,1,1,1"),
        ("technical", "0,0,0,0"),
        # ("admin", "1,1,1,1"),  # Rol temporal
    ]

    for entitie, report in zip(perm_entities, perm_reports):
        rol_entitie, perm_e = entitie
        rol_repor, perm_r = report

        # Same for al roles
        content_file.append(
            f"access_waste_control_main_view_{rol_entitie},waste_control_main_view_{rol_entitie},model_waste_control_main_view,group_{rol_entitie},1,0,0,0"
        )

        for var_name in entities_list:
            var_name = var_name.strip()
            content_file.append(
                f"access_waste_control_{var_name}_{rol_entitie},waste_control_{var_name}_{rol_entitie},model_waste_control_{var_name},group_{rol_entitie},{perm_e}"
            )

        content_file.append("")

        for var_name in report_list:
            var_name = var_name.strip()
            content_file.append(
                f"access_waste_control_{var_name}_{rol_repor},waste_control_{var_name}_{rol_repor},model_waste_control_{var_name},group_{rol_repor},{perm_r}"
            )

        content_file.append("")

    write_on_file("./security/ir.model.access.csv", "\n".join(content_file))


def generate_roles_rules():
    content_file = []

    entities_list = get_file_content("./tools/utils/entities.txt")

    rols_list = [
        "auditor",
        "editor",
        "it",
        "leadership",
        "technical",
        # "admin",  # Rol temporal
    ]

    for rol in rols_list:
        content_file = []
        content_file.append(xml_head)

        for var_name in entities_list:
            content_file.append(get_template(rol, var_name))

        content_file.append(xml_end)
        write_on_file(
            f"./security/waste_control_{rol}_security.xml", "\n".join(content_file)
        )


if __name__ == "__main__":
    generate_access_file()
    # generate_roles_rules()
    print("FIN")
