const CACHE = 'gsp-v2';

self.addEventListener('install', e => self.skipWaiting());

self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.map(k => caches.delete(k)))).then(() => clients.claim())
));

self.addEventListener('fetch', e => {
  const u = e.request.url;
  if (!u.startsWith('http')) return;
  if (u.includes('supabase.co') || e.request.method !== 'GET') return;
  e.respondWith(fetch(e.request).catch(() => new Response('offline')));
});

self.addEventListener('message', e => {
  if (e.data && e.data.type === 'CHECK_RESERVAS') {
    const hoy = new Date().toISOString().split('T')[0];
    (e.data.reservas || []).forEach(r => {
      const dias = Math.ceil((new Date(r.lanzamiento) - new Date(hoy)) / 86400000);
      if (dias === 0 || dias === 1 || dias === 3 || dias === 7) {
        const emoji = dias === 0 ? '\u{1F534}' : dias === 1 ? '\u{1F7E0}' : '\u{1F7E1}';
        self.registration.showNotification(emoji + ' Reserva: ' + r.nombre, {
          body: dias === 0 ? 'Lanza HOY' : 'Lanza en ' + dias + ' dia' + (dias > 1 ? 's' : ''),
          tag: 'reserva-' + r.id,
          data: { url: location.origin }
        });
      }
    });
  }
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow((e.notification.data && e.notification.data.url) || location.origin));
});
