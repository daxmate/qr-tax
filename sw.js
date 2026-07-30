/* 二维码生成器 - Service Worker */
const CACHE = 'qr-tax-v1';

const PRECACHE = [
  '.',
  'index.html',
  'manifest.json',
  'icon-192.svg',
  'icon-512.svg',
  'https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.min.js',
  'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js'
];

// 安装：预缓存核心资源
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return cache.addAll(PRECACHE);
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

// 激活：清理旧缓存
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE; })
            .map(function(k) { return caches.delete(k); })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});

// 请求拦截：缓存优先，网络回退
self.addEventListener('fetch', function(e) {
  var url = e.request.url;

  // 仅缓存 GET 请求
  if (e.request.method !== 'GET') return;

  e.respondWith(
    caches.match(e.request).then(function(cached) {
      if (cached) return cached;

      return fetch(e.request).then(function(resp) {
        if (resp && resp.ok) {
          var clone = resp.clone();
          caches.open(CACHE).then(function(cache) {
            cache.put(e.request, clone);
          });
        }
        return resp;
      }).catch(function() {
        // 离线且无缓存时返回离线页面
        return caches.match('.');
      });
    })
  );
});
