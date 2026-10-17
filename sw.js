// 离线缓存：首次打开时缓存 FILES 里的全部文件，之后断网也能运行。
// 读取策略：先返回缓存里的版本，同时在后台请求新版本并更新缓存（下次打开时生效）。
// VERSION：缓存名称，换新名称后旧缓存会在激活时删除。FILES：安装时预先缓存的文件列表。
var VERSION = 'qiuqiu-v9';
var FILES = [
  './',
  'index.html',
  'manifest.webmanifest',
  'icons/favicon.png',
  'icons/apple-touch-icon.png',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/maskable-512.png',
  'assets/bg.png',
  'assets/hole-back.png',
  'assets/hole-front.png',
  'assets/hammer.png',
  'assets/fox.png',
  'assets/fox-hit.gif',
  'assets/fox-miss.gif',
  'assets/leopard-a.png',
  'assets/leopard-a-miss.gif',
  'assets/leopard-b.png',
  'assets/leopard-b-miss.gif',
  'assets/carrot.png',
  'assets/carrot-feed-fox.gif',
  'assets/carrot-feed-leopard.gif',
  'assets/face.gif'
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(VERSION)
      .then(function (c) { return c.addAll(FILES); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== VERSION; })
        .map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;

  e.respondWith(caches.open(VERSION).then(function (cache) {
    return cache.match(req, { ignoreSearch: true }).then(function (cached) {
      var fresh = fetch(req).then(function (res) {
        if (res && res.ok) cache.put(req, res.clone());
        return res;
      }).catch(function () { return cached; });
      return cached || fresh;
    });
  }));
});
