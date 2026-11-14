const CACHE = "iki-yildiz-v3";
const FILES = ["./", "index.html", "admin.html", "manifest.webmanifest", "manifest-admin.webmanifest", "icons/icon.svg", "icons/icon-192.png", "icons/icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  // Önce ağ, olmazsa önbellek (güncellemeler hemen görünsün)
  e.respondWith(
    fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy));
      return res;
    }).catch(() => caches.match(req).then(r => r || caches.match("index.html")))
  );
});

self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({type: "window"}).then(list => {
    for (const c of list) if ("focus" in c) return c.focus();
    return clients.openWindow("admin.html");
  }));
});
