import { precacheAndRoute } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';

const baseUrl = process.env.NODE_ENV === 'development' ? '' : '/apps/parking';

const updatedManifest = (self.__WB_MANIFEST || []).map((entry) => {
  if (entry.url.includes('/sw.js')) { 
    entry.url = `${baseUrl}/sw.js`;
  }
  return entry;
});

precacheAndRoute(updatedManifest);
clientsClaim();

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};

  self.registration.showNotification(data.title || 'Título por defecto', {
    body: data.body || 'Cuerpo de notificación por defecto',
    icon: `${baseUrl}/images/icon-192.png`,
    badge: `${baseUrl}/images/icon-192.png`,
  });
});
