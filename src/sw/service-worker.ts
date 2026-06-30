/// <reference lib="webworker" />

import { APP_FILE_LIST } from './app-file-list';
import { VERSION } from './version';

// ✅ Explicitly type self as ServiceWorkerGlobalScope
declare const self: ServiceWorkerGlobalScope;

const CACHE_NAME = VERSION;

// --- Install Event ---
self.addEventListener('install', (event: ExtendableEvent) => {
  console.log('[SW] Install event:', CACHE_NAME);
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching app shell');
      return cache.addAll(APP_FILE_LIST);
    })
  );
});

// --- Activate Event ---
self.addEventListener('activate', (event: ExtendableEvent) => {
  console.log('[SW] Activate event:', CACHE_NAME);
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    })
  );
});

// --- Fetch Event ---
self.addEventListener('fetch', (event: FetchEvent) => {
  // Skip non-GET requests and browser-internal requests
  if (event.request.method !== 'GET' || event.request.url.includes('chrome-extension')) {
    return;
  }

  const url = new URL(event.request.url);

  // Only handle requests for our app's origin
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          // Return cached version
          return cachedResponse;
        }
        // Fall back to network
        return fetch(event.request);
      })
    );
  }
});