/* ── 수행평가 채점 기록 Service Worker v1.3.0 ── */
const CACHE = 'suhaeng-v1.4.7';
const ASSETS = [
  './',
  './수행평가_채점기록.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'
];

/* 설치: 핵심 파일 캐시 */
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

/* 활성화: 이전 캐시 삭제 */
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

/* 요청: 외부 API는 그냥 통과, 나머지는 캐시 우선 */
self.addEventListener('fetch', e => {
  const url = e.request.url;
  // googleapis, cdnjs 등 외부 요청은 SW가 개입하지 않음
  if(url.includes('googleapis.com') || url.includes('cdnjs.cloudflare.com')){
    return;
  }
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        if (!res || res.status !== 200 || res.type === 'opaque') return res;
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      });
    }).catch(() => caches.match('./index.html'))
  );
});
