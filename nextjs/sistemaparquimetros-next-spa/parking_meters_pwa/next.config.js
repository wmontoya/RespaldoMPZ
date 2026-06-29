/** @type {import('next').NextConfig} */
const os = require('os');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.production' });
const IP_API_PRODUCCION = '172.19.0.37';
const currentIP = Object.values(os.networkInterfaces()).flat().find((iface) => iface && iface.family === 'IPv4' && !iface.internal)?.address;

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  scope:  '/', // api y local
  // scope: '/apps/parking/',
  sw: "sw.js",
  swSrc: 'public/custom-sw.js', 
});

const isProd = process.env.NODE_ENV === 'production' && currentIP != IP_API_PRODUCCION;

module.exports = withPWA({
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_API_REQUEST: process.env.NEXT_API_REQUEST,
    NEXT_PUBLIC_MANIFEST_PATH: process.env.NEXT_PUBLIC_MANIFEST_PATH,
    NEXT_PUBLIC_ENCRYPTION_KEY: process.env.NEXT_PUBLIC_ENCRYPTION_KEY,
    NEXT_PUBLIC_VAPID_PUBLIC_KEY: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    NEXT_PUBLIC_ICON_ESCUDO:process.env.NEXT_PUBLIC_ICON_ESCUDO
  },
  // PARA CREAR ARCHIVOS DEL SITIO FRONT SE OCUPAN ESTOS
  // ...(isProd && {
    // output: 'export',
    // basePath: '/apps/parking',
    // assetPrefix: '/apps/parking/',
  // }),
  trailingSlash: true,
});
