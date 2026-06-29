require('dotenv').config({ path: './.env.production' });

module.exports = {
  apps: [{
    name: 'alquileres_api',
    script: './dist/index.js',
    env: {
      NODE_ENV: 'production',
      PORT: 3070,
      API_ODOO_URL: process.env.API_ODOO_URL,
      API_ODOO_DATABASE: process.env.API_ODOO_DATABASE,
      API_ODOO_LIMITED_WEB_USER: process.env.API_ODOO_LIMITED_WEB_USER,
      API_ODOO_LIMITED_WEB_USER_PASSWORD: process.env.API_ODOO_LIMITED_WEB_USER_PASSWORD,
      CORS_ORIGINS: process.env.CORS_ORIGINS
    }
  }]
}