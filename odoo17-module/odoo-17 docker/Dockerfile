FROM odoo:17.0

USER root

RUN apt-get update && apt-get install -y python3-venv && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

COPY ./requirements.txt /etc/odoo/odoo/requirements.txt
RUN python3 -m venv /opt/odoo-venv && \
    /opt/odoo-venv/bin/pip install -r /etc/odoo/odoo/requirements.txt && \
    rm /etc/odoo/odoo/requirements.txt

ENV PATH="/opt/odoo-venv/bin:$PATH"
ENV PYTHONPATH="/usr/lib/python3/dist-packages:/opt/odoo-venv/lib/python3.10/site-packages"

RUN cp -r /usr/lib/python3/dist-packages/odoo /opt/odoo-venv/lib/python3.10/site-packages/
