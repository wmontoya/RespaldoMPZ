# Templates
from string import Template

xml_head = f"""<?xml version="1.0" encoding="UTF-8"?>
<odoo>
  <data noupdate="1">"""

xml_end = f"""  </data>
</odoo>"""

content_technical = Template("""
    <!-- ** ${var_name} ** -->
    <record id="waste_control_${var_name}_rule_group_technical" model="ir.rule">
      <field name="name">Technical users rule</field>
      <field name="model_id" ref="model_waste_control_${var_name}" />
      <field name="domain_force">[(1, '=', 1)]</field>
      <field name="groups" eval="[(4, ref('waste_control.group_technical'))]" />
      <field name="perm_read" eval="1" />
      <field name="perm_write" eval="1" />
      <field name="perm_create" eval="1" />
      <field name="perm_unlink" eval="0" />
    </record>

    <!-- Special rule for delete - only own records -->
    <record id="waste_control_${var_name}_delete_rule_group_technical" model="ir.rule">
      <field name="name">Technical users can only delete own records</field>
      <field name="model_id" ref="model_waste_control_${var_name}" />
      <field name="domain_force">[('create_uid', '=', user.id)]</field>
      <field name="groups" eval="[(4, ref('waste_control.group_technical'))]" />
      <field name="perm_read" eval="0" />
      <field name="perm_write" eval="0" />
      <field name="perm_create" eval="0" />
      <field name="perm_unlink" eval="1" />
    </record>""")

content_auditor = Template("""
     <!-- ** ${var_name} ** -->
    <record id="waste_control_${var_name}_rule_group_auditor" model="ir.rule">
      <field name="name">Auditor users rule</field>
      <field name="model_id" ref="model_waste_control_${var_name}" />
      <field name="domain_force">[(1, '=', 1)]</field>
      <field name="groups" eval="[(4, ref('waste_control.group_auditor'))]" />
      <field name="perm_write" eval="0" />
      <field name="perm_create" eval="0" />
      <field name="perm_unlink" eval="0" />
    </record>""")

content_editor = Template("""
     <!-- ** ${var_name} ** -->
    <record id="waste_control_${var_name}_rule_group_editor" model="ir.rule">
      <field name="name">Editor users rule</field>
      <field name="model_id" ref="model_waste_control_${var_name}" />
      <field name="domain_force">[(1, '=', 1)]</field>
      <field name="groups" eval="[(4, ref('waste_control.group_editor'))]" />
    </record>""")

content_leadership = Template("""
     <!-- ** ${var_name} ** -->
    <record id="waste_control_${var_name}_rule_group_leadership" model="ir.rule">
      <field name="name">Leadership users rule</field>
      <field name="model_id" ref="model_waste_control_${var_name}" />
      <field name="domain_force">[(1, '=', 1)]</field>
      <field name="groups" eval="[(4, ref('waste_control.group_leadership'))]" />
      <field name="perm_write" eval="0" />
      <field name="perm_create" eval="0" />
      <field name="perm_unlink" eval="0" />
    </record>""")

content_it = Template("""
     <!-- ** ${var_name} ** -->
    <record id="waste_control_${var_name}_rule_group_it" model="ir.rule">
      <field name="name">IT users rule</field>
      <field name="model_id" ref="model_waste_control_${var_name}" />
      <field name="domain_force">[(1, '=', 1)]</field>
      <field name="groups" eval="[(4, ref('waste_control.group_it'))]" />
    </record>""")

content_admin = Template("""
     <!-- ** ${var_name} ** -->
    <record id="waste_control_${var_name}_rule_group_admin" model="ir.rule">
      <field name="name">Admin users rule</field>
      <field name="model_id" ref="model_waste_control_${var_name}" />
      <field name="domain_force">[(1, '=', 1)]</field>
      <field name="groups" eval="[(4, ref('waste_control.group_admin'))]" />
    </record>""")


def get_template(rol_name: str, input_var_name: str) -> str:
    switch = {
        "technical": content_technical,
        "auditor": content_auditor,
        "editor": content_editor,
        "leadership": content_leadership,
        "it": content_it,
        "admin": content_admin,
    }

    template = switch.get(rol_name)
    if template is None:
        print("Eror, seleccion no valida:", rol_name)
        raise
    input_var_name = input_var_name.strip()
    return template.substitute(var_name=input_var_name)
