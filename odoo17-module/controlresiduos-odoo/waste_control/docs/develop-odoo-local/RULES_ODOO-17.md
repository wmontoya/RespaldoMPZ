# Odoo 17 Rules and Restrictions

- [Odoo 17 Rules and Restrictions](#odoo-17-rules-and-restrictions)
  - [Access and Security](#access-and-security)
  - [Do not use "attrs"](#do-not-use-attrs)
  - [Customization and Development](#customization-and-development)
  - [Functional Restrictions](#functional-restrictions)
  - [Integrations and Automation](#integrations-and-automation)
  - [Audit and Traceability](#audit-and-traceability)
  - [Reglas](#reglas)
  - [Odoo fields](#odoo-fields)

## Access and Security

- Each user must have an assigned role with specific permissions.
- Passwords must comply with established security requirements.
- Access to modules and data is restricted according to user permissions.

## Do not use "attrs"

- Mass deletion of records is not allowed without authorization.
- Data must be entered accurately and completely.
- Relationships between models must be respected.
- The use of `attrs` attributes in views to restrict access or field visibility is not allowed; proper access rules and permissions must be used.
- **The `attrs` attribute cannot be used in any way, as Odoo 17 does not accept it.**

## Customization and Development

- All customization must be done through custom modules, not by modifying the base code.
- Updates must be tested in a staging environment before being applied to production.
- Odoo development best practices must be followed (field names, model inheritance, views, etc.).
- Direct modification of Odoo standard files is not allowed; all changes must be inherited or extended.

## Functional Restrictions

- Workflows (sales, purchases, inventory) must follow the processes defined by the company.
- Creation of duplicate records (customers, products, etc.) is not allowed.
- Legal documents (bills, delivery notes) cannot be modified once validated.

## Integrations and Automation

- Integrations with external systems must be authorized and documented.
- Automation (scheduled actions, automatic rules) must be reviewed periodically.

## Audit and Traceability

- All relevant actions must be recorded in the system (logs, change history).
- Document and movement traceability must be ensured.

## Reglas

1. Usa `snake_case` tanto para Python como para XML.
2. Establece `max-line-length = 100`.
3. Las entidades/modelos deben tener nombres en plural.
4. Sigue la convención de nombres: `entity_name_view.xml`. (nombre)\_(tipo de elemento) para todas las convenciones de nombres
5. Los textos visuales deben iniciar con mayúscula y el resto en minúscula, como en una oración. Ejemplo: "Nombre de persona"
6. Para relaciones `one2many` o `many2one`, usa los atributos: `model_name_ids` / `model_name_id`. El nombre del modelo debe ser plural

## Odoo fields

```py
name = fields.Char(
    related='partner_id.name',         # Related field (if applicable)
    inverse='_inverse_name',           # Inverse method (if computed)
    comodel_name="res.partner",
    string="Name",                     # Visible label in the interface
    size=128,                          # Maximum size (only for Char)
    index=True,                        # Indexed in the database
    store=True,                        # Stored in the database (for related/computed fields)
    required=True,                     # Required
    readonly=False,                    # Read-only

    default="No name",                 # Default value

    compute='_compute_name',           # Compute method (if computed)
    ondelete='cascade',                # On delete action (for relations)
    domain="[('active','=',True)]",    # Selection domain (for relations)
    help="Full contact name",          # Help text
)

    states={'done': [('readonly', True)]}, # Conditional state
    groups="base.group_user",               # Group restriction
    tracking=True,                          # Chatter tracking
    search='_search_name',                  # Custom search method
    translate=True,                         # Translation enabled
    copy=True,                              # Copied when duplicating the record

```
