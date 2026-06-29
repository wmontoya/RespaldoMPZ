# comandos

## realizar pruebas

```bash
cd "C:\Program Files\Odoo 17.0.2\server\customs\waste_control"
if exist tests\out\report_forms.json del tests\out\report_forms.json
python -m unittest discover -s tests\unit -p "test_*.py"
python -m unittest discover -s tests\modular -p "test_*.py"
```

## generar md

```bash
cd "C:\Program Files\Odoo 17.0.2\server\customs\waste_control"
python tests/utils/json_to_markdown.py tests/out/report_forms.json > tests/out/report_forms.md
```
