const CACHE_NAME = 'eco-gadget-hub-v1';
const urlsToCache = [
  '/EcoGadgetHubPWA/',
  '/EcoGadgetHubPWA/index.html',
  '/EcoGadgetHubPWA/manifest.json',
  '/EcoGadgetHubPWA/icons/icon-192x192.png',
  '/EcoGadgetHubPWA/icons/icon-512x512.png',
  '/EcoGadgetHubPWA/images/Biodegradable-Phone-Case.webp',
  '/EcoGadgetHubPWA/images/Eco-friendly-gadgets-collection.webp',
  '/EcoGadgetHubPWA/images/Recycled-Wireless-Earbuds.webp',
  '/EcoGadgetHubPWA/images/Smart-Eco-Light.webp',
  '/EcoGadgetHubPWA/images/Solar-Phone-Charger.webp',
  '/EcoGadgetHubPWA/offline.html'
];

// Install Event
self.addEventListener("install", (event) => {
  console.log("[ServiceWorker] Install");
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[ServiceWorker] Caching files");
      return cache.addAll(urlsToCache);
    })
  );
});

// Activate Event
self.addEventListener("activate", (event) => {
  console.log("[ServiceWorker] Activate");
  event.waitUntil(
    caches.keys().then((keyList) =>
      Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("[ServiceWorker] Removing old cache", key);
            return caches.delete(key);
          }
        })
      )
    )
  );
  return self.clients.claim();
});


// Enhanced Fetch Event
self.addEventListener("fetch", (event) => {
  console.log("[ServiceWorker] Fetch", event.request.url);
  const requestURL = new URL(event.request.url);


  // If request is same-origin, use Cache First
  if (requestURL.origin === location.origin) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        return ( cachedResponse ||
          fetch(event.request).catch(() => caches.match("offline.html"))
        );
      })
    );
  } else {
    // Else, use Network First
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          return response;
        })
        .catch(() =>
          caches.match(event.request).then((res) => {
            return res || caches.match("offline.html");
          })
        )
    );
  }
});


// Sync Event (simulation)
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-data") {
    event.waitUntil(
      (async () => {
        console.log("Sync event triggered: 'sync-data'");
        // Here you can sync data with server when online
      })()
    );
  }
});


// Push Event
self.addEventListener("push", function (event) {
  if (event && event.data) {
    let data = {};
    try {
      data = event.data.json();
    } catch (e) {
      data = {
        method: "pushMessage",
        message: event.data.text(),
      };
    }


    if (data.method === "pushMessage") {
      console.log("Push notification sent");
      event.waitUntil(
        self.registration.showNotification("Eco Friendly Gadgets Collection", {
          body: data.message,
        })
      );
    }
  }
});
