/******/ (() => { // webpackBootstrap
/******/ 	"use strict";

;// ./src/sw/app-file-list.ts
const APP_FILE_LIST = [
    "/",
    "/404.html",
    "/chevron.svg",
    "/favicon.ico",
    "/icon-192.png",
    "/icon-512.png",
    "/index.html",
    "/index.txt",
    "/line-vertical.svg",
    "/manifest.webmanifest",
    "/_next/static/chunks/0cz1d0mv5g_q7.js",
    "/_next/static/chunks/14mumt5_n0xhi.js",
    "/_next/static/chunks/17c2xufnf7-1b.js",
    "/_next/static/chunks/1bx-54gma2jwf.js",
    "/_next/static/chunks/1d4h-sglyo8ft.js",
    "/_next/static/chunks/1k27gmj_js8n3.js",
    "/_next/static/chunks/21zf9l2iy0alh.js",
    "/_next/static/chunks/2e62y-rksf3vf.css",
    "/_next/static/chunks/2nwqoerny79-z.js",
    "/_next/static/chunks/3peubv2924kx4.js",
    "/_next/static/chunks/turbopack-24k8m976xxp6r.js",
    "/_next/static/media/favicon.2vob68tjqpejf.ico",
    "/_next/static/W0leyH0VyO3eOCtuDsXIw/_buildManifest.js",
    "/_next/static/W0leyH0VyO3eOCtuDsXIw/_clientMiddlewareManifest.js",
    "/_next/static/W0leyH0VyO3eOCtuDsXIw/_ssgManifest.js",
    "/_not-found/__next._full.txt",
    "/_not-found/__next._head.txt",
    "/_not-found/__next._index.txt",
    "/_not-found/__next._not-found/__PAGE__.txt",
    "/_not-found/__next._not-found.txt",
    "/_not-found/__next._tree.txt",
    "/_not-found.html",
    "/_not-found.txt",
    "/__next._full.txt",
    "/__next._head.txt",
    "/__next._index.txt",
    "/__next._tree.txt",
    "/__next.__PAGE__.txt"
];

;// ./src/sw/service-worker.ts
/// <reference lib="webworker" />


const CACHE_NAME = (/* inlined export .VERSION */"0.1.0");
// --- Install Event ---
self.addEventListener('install', (event) => {
    console.log('[SW] Install event:', CACHE_NAME);
    event.waitUntil(caches.open(CACHE_NAME).then((cache) => {
        console.log('[SW] Caching app shell');
        return cache.addAll(APP_FILE_LIST);
    }));
});
// --- Activate Event ---
self.addEventListener('activate', (event) => {
    console.log('[SW] Activate event:', CACHE_NAME);
    event.waitUntil(caches.keys().then((cacheNames) => {
        return Promise.all(cacheNames
            .filter((cacheName) => cacheName !== CACHE_NAME)
            .map((cacheName) => {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
        }));
    }));
});
// --- Fetch Event ---
self.addEventListener('fetch', (event) => {
    // Skip non-GET requests and browser-internal requests
    if (event.request.method !== 'GET' || event.request.url.includes('chrome-extension')) {
        return;
    }
    const url = new URL(event.request.url);
    // Only handle requests for our app's origin
    if (url.origin === self.location.origin) {
        event.respondWith(caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
                // Return cached version
                return cachedResponse;
            }
            // Fall back to network
            return fetch(event.request);
        }));
    }
});

/******/ })()
;