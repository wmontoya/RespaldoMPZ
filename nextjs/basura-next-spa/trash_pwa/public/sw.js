importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

const isLocalhost =
  self.location.hostname === 'localhost' ||
  self.location.hostname === '127.0.0.1' ||
  self.location.hostname === '0.0.0.0';

// In prod builds, Workbox injects `__WB_MANIFEST` with real entries. In dev, it’s often missing/empty.
const hasPrecacheManifest =
  Array.isArray(self.__WB_MANIFEST) && self.__WB_MANIFEST.length > 0;

// Dev mode here means: localhost AND no precache manifest (typically `next dev`).
const isDev = isLocalhost && !hasPrecacheManifest;

// Derive base path from where the service worker is served (works for both `/sw.js` and `/apps/trash/sw.js`)
const swPathname = new URL(self.location.href).pathname;
const baseUrl = swPathname.endsWith('/sw.js') ? swPathname.slice(0, -'/sw.js'.length) : '';
const appShell = `${baseUrl}/`;

if (self.workbox) {
  // Disable debug logs early
  if (self.workbox.setConfig) {
    self.workbox.setConfig({ debug: false });
  }
  const { precacheAndRoute, cleanupOutdatedCaches, matchPrecache } = self.workbox.precaching;
  const { clientsClaim } = self.workbox.core;
  const { registerRoute, NavigationRoute, setCatchHandler } = self.workbox.routing;
  const { CacheFirst, NetworkFirst, NetworkOnly, StaleWhileRevalidate } = self.workbox.strategies;
  const { ExpirationPlugin } = self.workbox.expiration;
  const { CacheableResponsePlugin } = self.workbox.cacheableResponse;

  // Silence Workbox debug logs (especially noisy in dev/offline)
  if (self.workbox.core && self.workbox.core.setLogLevel) {
    self.workbox.core.setLogLevel(self.workbox.core.LOG_LEVELS.silent);
  }

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

  // Avoid precaching navigations like `/` with a null revision, as that can pin a stale HTML shell indefinitely.
  // Navigation caching is handled by the `pages` route below (NetworkFirst + offline fallback).
  // In dev, avoid precaching altogether to prevent stale code during HMR when SW is enabled.
  precacheAndRoute(isDev ? [] : updatedManifest);
  cleanupOutdatedCaches();
  clientsClaim();

  const matchWithBase = (pathname, prefix) =>
    pathname.startsWith(prefix) || (baseUrl ? pathname.startsWith(`${baseUrl}${prefix}`) : false);

  const escapeForRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // In dev (`next dev`) this service worker is a frequent source of hydration mismatches because it can serve
  // mixed versions of client chunks. Keep push support, but do not cache app assets/pages.
  if (isDev) {
    registerRoute(
      ({ request }) => request.mode === 'navigate',
      new NetworkOnly({ fetchOptions: { cache: 'no-store' } })
    );
    registerRoute(
      ({ url }) => matchWithBase(url.pathname, '/_next/static/'),
      new NetworkOnly({ fetchOptions: { cache: 'no-store' } })
    );
    registerRoute(
      ({ url }) => matchWithBase(url.pathname, '/__nextjs_font/'),
      new NetworkOnly({ fetchOptions: { cache: 'no-store' } })
    );
  }

  if (!isDev) {
  // App shell: cache navigations so the last page loads offline
  const navigationHandler = new NetworkFirst({
    cacheName: 'pages',
    fetchOptions: { cache: 'no-store' },
    plugins: [
      offlineFallback,
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24 * 7,
      }),
    ],
  });

  registerRoute(
    new NavigationRoute(navigationHandler, {
      allowlist: baseUrl ? [new RegExp(`^${escapeForRegExp(baseUrl)}/`)] : undefined,
    })
  );

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
      fetchOptions: { cache: 'no-store' },
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
    ({ url }) => matchWithBase(url.pathname, '/_next/static/'),
    isDev
      ? new NetworkFirst({
        cacheName: 'next-static-dev',
        fetchOptions: { cache: 'no-store' },
      })
      : new CacheFirst({
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
    ({ url }) => matchWithBase(url.pathname, '/__nextjs_font/'),
    isDev
      ? new NetworkFirst({
        cacheName: 'next-fonts-dev',
        fetchOptions: { cache: 'no-store' },
      })
      : new CacheFirst({
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
    ({ url }) => matchWithBase(url.pathname, '/leaflet/'),
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
      fetchOptions: { cache: 'no-store' },
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
    ({ url }) =>
      url.pathname.endsWith('manifest.dev.json') ||
      url.pathname.endsWith('manifest.prod.json') ||
      url.pathname.endsWith('manifest.json'),
    new StaleWhileRevalidate({
      cacheName: 'manifest',
    })
  );

  registerRoute(
    ({ url }) => matchWithBase(url.pathname, '/images/'),
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
      fetchOptions: { cache: 'no-store' },
      plugins: [
        new ExpirationPlugin({
          maxEntries: 5,
          maxAgeSeconds: 60 * 60 * 24 * 30,
        }),
      ],
    })
  );

  // Cache map tiles for offline usage
  const tileFallbackPlugin = {
    handlerDidError: async ({ request }) => {
      try {
        const cache = await caches.open('osm-tiles');
        const cached = await cache.match(request);
        if (cached) return cached;
      } catch (err) {
        console.warn('Tile fallback error:', err);
      }
      // Return empty response to avoid throwing when offline + tile not cached
      return new Response('', { status: 204, statusText: 'No Content' });
    },
  };

  registerRoute(
    ({ url }) => url.hostname.endsWith('tile.openstreetmap.org'),
    new CacheFirst({
      cacheName: 'osm-tiles',
      plugins: [
        new CacheableResponsePlugin({
          statuses: [0, 200],
        }),
        tileFallbackPlugin,
        new ExpirationPlugin({
          maxEntries: 200,
          maxAgeSeconds: 60 * 60 * 24 * 30,
        }),
      ],
    })
  );
  }
} else {
  console.warn('Workbox failed to load in service worker.');
}

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('push-legacy', (event) => {
  const data = event.data ? event.data.json() : {};

  self.registration.showNotification(data.title || 'Título por defecto', {
    body: data.body || 'Cuerpo de notificación por defecto',
    icon: `${baseUrl}/images/icon-192.png`,
    badge: `${baseUrl}/images/icon-192.png`,
  });
});

// ---------------------------------------------------------------------------------------

self.addEventListener('install-legacy', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    await self.clients.claim();

    if (!isDev || !('caches' in self)) return;

    const devCachePrefixes = [
      'pages',
      'rsc',
      'next-static',
      'next-fonts',
      'leaflet-assets',
      'api-rutas',
      'manifest',
      'images',
      'geojson',
      'osm-tiles',
      'workbox-precache',
    ];

    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter((key) => devCachePrefixes.some((prefix) => key === prefix || key.startsWith(prefix)))
        .map((key) => caches.delete(key))
    );
  })());
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
    console.error('Payload inválido', e);
    return;
  }

  const options = {
    body: data.body || '',
    icon: `${baseUrl}/images/icon-192.png`,
    badge: `${baseUrl}/images/icon-192.png`,
    vibrate: [100, 50, 100],
    data: {
      url: data.url || appShell,
    },
    requireInteraction: true
  };

  event.waitUntil(
    self.registration.showNotification(
      data.title || 'Notificación',
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
  console.warn('La suscripción cambió, debe renovarse');
});
