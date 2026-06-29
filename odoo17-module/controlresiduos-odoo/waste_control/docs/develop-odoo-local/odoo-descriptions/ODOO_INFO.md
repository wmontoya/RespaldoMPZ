#

## XML

### noupdate

noupdate="0" (or noupdate="false"):
The data is updated when you update the module. That is, if you change the XML and update the module, the records in the database are modified.

noupdate="1" (or noupdate="true"):
The data is NOT updated in future module updates. It is only created the first time you install the module. If you change the XML later, those changes are not applied to records already created.

Summary:

noupdate="0": Updatable data
noupdate="1": Data not updatable after installation

## import/export

<https://www.odoo.com/documentation/17.0/applications/essentials/export_import_data.html>

## Entity Structure

### Model Inheritance

```python
_inherit = ["waste_control.base_model", "mail.thread"]
```

### Component Descriptions

- **`base_model`**  
    Entity that provides common methods and default attributes to other entities.

- **`mail.thread`**  
    Allows the model to have a *chatter* (message panel) where messages, notes, and change history can be recorded. Facilitates communication and tracking of activities related to the record.

- **`mail.activity.mixin`**  
    Allows scheduling and managing activities (tasks, reminders, calls, etc.) associated with the record. Users can view and mark activities as completed directly from the record.
