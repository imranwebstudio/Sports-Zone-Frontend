// Pass cross-origin API requests directly to the network.
self.addEventListener('fetch', (event) => {
  if (new URL(event.request.url).origin !== self.location.origin) {
    event.respondWith(fetch(event.request));
  }
});

self.options = {
    "domain": "5gvci.com",
    "zoneId": 11130992
}
self.lary = ""
importScripts('https://5gvci.com/act/files/service-worker.min.js?r=sw')
