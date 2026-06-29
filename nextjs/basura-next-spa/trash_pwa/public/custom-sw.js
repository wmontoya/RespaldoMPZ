importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

const isDev = self.location.hostname === 'localhost' || self.location.hostname === '127.0.0.1';
const baseUrl = isDev ? '' : '/apps/trash';
const appShell = `${baseUrl}/`;

if (self.workbox) {
  const { precacheAndRoute, matchPrecache } = self.workbox.precaching;
  const { clientsClaim } = self.workbox.core;
  const { registerRoute, NavigationRoute, setCatchHandler } = self.workbox.routing;
  const { CacheFirst, NetworkFirst, StaleWhileRevalidate } = self.workbox.strategies;
  const { ExpirationPlugin } = self.workbox.expiration;

  const offlineFallback = {
    handlerDidError: async () => {
      const precached = await matchPrecache(appShell);
      if (precached) return precached;
      const cached = await caches.match(appShell, { ignoreSearch: true });
      if (cached) return cached;
      return Response.error();
    },
  };

  const updatedManifest = (self.__WB_MANIFEST || []).map((entry) => {
    if (entry.url.includes('/sw.js')) { 
      entry.url = `${baseUrl}/sw.js`;
    }
    return entry;
  });

  const precacheEntries = [
    ...updatedManifest,
    { url: appShell, revision: null },
    { url: `${baseUrl}/rutas`, revision: null },
  ];

  precacheAndRoute(precacheEntries);
  clientsClaim();

  // App shell: cache navigations so the last page loads offline
  const navigationHandler = new NetworkFirst({
    cacheName: 'pages',
    networkTimeoutSeconds: 3,
    plugins: [
      offlineFallback,
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24 * 7,
      }),
    ],
  });

  registerRoute(new NavigationRoute(navigationHandler));

  // Cache RSC (App Router) requests so route changes work offline
  const stripRscParam = {
    cacheKeyWillBeUsed: async ({ request }) => {
      const url = new URL(request.url);
      if (url.searchParams.has('_rsc')) {
        url.searchParams.delete('_rsc');
        return url.toString();
      }
      return request;
    },
  };

  registerRoute(
    ({ url, request }) =>
      request.headers.get('rsc') === '1' || url.searchParams.has('_rsc'),
    new NetworkFirst({
      cacheName: 'rsc',
      networkTimeoutSeconds: 3,
      plugins: [
        stripRscParam,
        new ExpirationPlugin({
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24,
        }),
      ],
    })
  );

  // Cache Next static chunks and fonts
  registerRoute(
    ({ url }) => url.pathname.startsWith('/_next/static/'),
    new CacheFirst({
      cacheName: 'next-static',
      plugins: [
        new ExpirationPlugin({
          maxEntries: 200,
          maxAgeSeconds: 60 * 60 * 24 * 30,
        }),
      ],
    })
  );

  registerRoute(
    ({ url }) => url.pathname.startsWith('/__nextjs_font/'),
    new CacheFirst({
      cacheName: 'next-fonts',
      plugins: [
        new ExpirationPlugin({
          maxEntries: 20,
          maxAgeSeconds: 60 * 60 * 24 * 365,
        }),
      ],
    })
  );

  // Cache local Leaflet assets (css/js/geojson) for offline map
  registerRoute(
    ({ url }) => url.pathname.startsWith('/leaflet/'),
    new CacheFirst({
      cacheName: 'leaflet-assets',
      plugins: [
        new ExpirationPlugin({
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24 * 30,
        }),
      ],
    })
  );

  // Cache routes API (map + rutas) for offline usage
  registerRoute(
    ({ url }) => url.pathname.endsWith('/api/v1/trash/rutas'),
    new NetworkFirst({
      cacheName: 'api-rutas',
      networkTimeoutSeconds: 3,
      plugins: [
        new ExpirationPlugin({
          maxEntries: 10,
          maxAgeSeconds: 60 * 60 * 24,
        }),
      ],
    })
  );

  // Cache manifest and icons used by the app shell
  registerRoute(
    ({ url }) => url.pathname.endsWith('manifest.dev.json') || url.pathname.endsWith('manifest.json'),
    new StaleWhileRevalidate({
      cacheName: 'manifest',
    })
  );

  registerRoute(
    ({ url }) => url.pathname.startsWith('/images/'),
    new CacheFirst({
      cacheName: 'images',
      plugins: [
        new ExpirationPlugin({
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 30,
        }),
      ],
    })
  );

  // If a navigation fails (e.g. offline + cache miss), fall back to the app shell
  setCatchHandler(async ({ request }) => {
    if (request.destination === 'document') {
      const precached = await matchPrecache(appShell);
      if (precached) return precached;
      const cached = await caches.match(appShell);
      if (cached) return cached;
    }
    return Response.error();
  });

  // Cache GeoJSON boundaries for offline usage
  registerRoute(
    ({ url }) => url.pathname.endsWith('/leaflet/perez_zeledon.geojson'),
    new NetworkFirst({
      cacheName: 'geojson',
      networkTimeoutSeconds: 3,
      plugins: [
        new ExpirationPlugin({
          maxEntries: 5,
          maxAgeSeconds: 60 * 60 * 24 * 30,
        }),
      ],
    })
  );

  // Cache map tiles for offline usage
  registerRoute(
    ({ url }) => url.hostname.endsWith('tile.openstreetmap.org'),
    new CacheFirst({
      cacheName: 'osm-tiles',
      plugins: [
        new ExpirationPlugin({
          maxEntries: 200,
          maxAgeSeconds: 60 * 60 * 24 * 30,
        }),
      ],
    })
  );
} else {
  console.warn('Workbox failed to load in service worker.');
}

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};

  self.registration.showNotification(data.title || 'TÃ­tulo por defecto', {
    body: data.body || 'Cuerpo de notificaciÃ³n por defecto',
    icon: `${baseUrl}/images/icon-192.png`,
    badge: `${baseUrl}/images/icon-192.png`,
  });
});

// ---------------------------------------------------------------------------------------

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('push', event => {
  if (!event.data) {
    console.warn('Push sin payload');
    return;
  }

  let data;
  try {
    data = event.data.json();
  } catch (e) {
    console.error('Payload invÃ¡lido', e);
    return;
  }

  const options = {
    body: data.body || '',
    icon: `${baseUrl}/images/icon-192x192.png`,
    badge: '/badge.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/',
    },
    requireInteraction: true
  };

  event.waitUntil(
    self.registration.showNotification(
      data.title || 'NotificaciÃ³n',
      options
    )
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        for (const client of clientList) {
          if (client.url === event.notification.data.url && 'focus' in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(event.notification.data.url);
        }
      })
  );
});

self.addEventListener('pushsubscriptionchange', event => {
  console.warn('La suscripciÃ³n cambiÃ³, debe renovarse');
});
