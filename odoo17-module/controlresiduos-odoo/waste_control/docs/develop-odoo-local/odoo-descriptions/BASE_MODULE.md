# Base module  in Odoo 17

## res.partner

`res.partner` is the main model for managing contacts in Odoo. It includes customers, vendors, employees, and any entity the company interacts with.

### Key Fields

- **name**: Contact name.
- **company_type**: Entity type (`person` or `company`).
- **parent_id**: Hierarchical relationship (main company).
- **child_ids**: Secondary contacts.
- **email, phone, mobile**: Contact information.
- **vat**: Tax identification number.
- **is_company**: Indicates if it is a company.
- **customer_rank / supplier_rank**: Indicates if it is a customer or vendor.
- **address fields**: `street`, `city`, `zip`, `state_id`, `country_id`.
- **user_id**: Assigned salesperson.
- **active**: Active/inactive status.

### Features

- **Inheritance**: Many modules extend `res.partner` (sales, purchase, CRM, etc.).
- **Hierarchy**: Allows structuring companies and related contacts.
- **Duplicates**: Odoo detects and suggests merging duplicate contacts.
- **Access**: Permissions managed by user groups.

### Common Usage

- Create customers/vendors.
- Link contacts to documents (bills, orders, opportunities).
- Filter and segment contacts.
- Integrate with other apps (Email, Marketing, Help desk).

### Considerations

- Customizable through fields and views.
- Supports multiple addresses per contact.
- Synchronization with other databases via API.

See the [official documentation](https://www.odoo.com/documentation/17.0/developer/reference/addons/base/res_partner.html) for advanced details.
