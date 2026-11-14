/* Laboratório de Projeto de Pesquisa: funciona offline depois da primeira visita.
   Estratégia: rede primeiro (sempre a versão mais nova); sem internet, usa a cópia guardada. */
const CACHE = 'lab-projeto-v1';
const BASE = ['./', './index.html', './dados/referencias.js', './dados/usos-acervo.js', './img/capa-livro.jpg', './img/icone-192.png', './manifest.webmanifest'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(BASE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request;
  if(r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  e.respondWith(fetch(r).then(res => { const cp = res.clone(); caches.open(CACHE).then(c => c.put(r, cp)); return res; })
    .catch(() => caches.match(r).then(x => x || caches.match('./index.html'))));
});
