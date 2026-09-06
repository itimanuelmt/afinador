const CACHE_NAME = 'afinador-v1';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon.svg',
  './css/styles.css',
  './js/main.js',
  './js/config/tuning.js',
  './js/services/AudioCaptureService.js',
  './js/services/PitchDetector.js',
  './js/services/NoteCalculator.js',
  './js/services/ReferenceToneService.js',
  './js/composables/useTuner.js',
  './js/components/App.js',
  './js/components/StringSelector.js',
  './js/components/TuningMeter.js',
  './js/components/FrequencyDisplay.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
