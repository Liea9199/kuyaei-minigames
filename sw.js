// 离线缓存：第一次打开时把整个游戏存到手机里，之后断网也能玩。
// 策略：先用缓存里的版本秒开，同时在后台拉新版本，下次打开就是新的。
// 增删文件后记得改 VERSION 和下面的列表。
var VERSION = 'qiuqiu-v1';
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
