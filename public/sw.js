const CACHE_NAME = 'clarity-canvas-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/src/index.jsx',
  '/src/App.jsx',
  '/src/theme.js',
  '/src/components/Canvas.jsx',
  '/src/components/ThoughtPicker.jsx',
  '/src/components/ThoughtMining.jsx',
  '/src/components/CardNeutralize.jsx',
  '/src/components/CardCommonGround.jsx',
  '/src/components/CardDataExtraction.jsx',
  '/src/components/ReadinessGate.jsx',
  '/src/components/CenteringExercise.jsx',
  '/src/components/BaseCard.jsx',
  '/src/components/common/ErrorState.jsx',
  '/src/components/common/Spinner.jsx',
  '/src/components/common/SkeletonCard.jsx',
  '/src/context/SessionContext.jsx',
  '/src/services/ContentSearchService.js',
  '/src/services/ErrorHandlingService.js',
  '/js/SessionStateManager.js',
  '/js/PsychologicalEngine.js',
  '/js/ContentManager.js',
  '/js/CalendarGenerator.js',
  '/js/ErrorHandler.js',
  '/js/FeedbackManager.js',
  '/js/topics.json',
  '/js/emotions.json',
  '/public/content/content-index.bin',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.url.endsWith('content-index.bin')) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          const fetchPromise = fetch(event.request).then((networkResponse) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
          return response || fetchPromise;
        });
      })
    );
  } else {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          if (response) {
            return response;
          }
          return fetch(event.request);
        })
    );
  }
});
