var V='lvn-v1',A=['./','index.html','lunar.js','manifest.json','icon-180.png','icon-192.png','icon-512.png'];
self.addEventListener('install',function(e){e.waitUntil(caches.open(V).then(function(c){return c.addAll(A)}).then(function(){return self.skipWaiting()}))});
self.addEventListener('activate',function(e){e.waitUntil(caches.keys().then(function(k){return Promise.all(k.filter(function(x){return x!==V}).map(function(x){return caches.delete(x)}))}).then(function(){return self.clients.claim()}))});
self.addEventListener('fetch',function(e){if(e.request.method!=='GET')return;
e.respondWith(caches.match(e.request).then(function(r){
var n=fetch(e.request).then(function(res){if(res&&res.ok){var cp=res.clone();caches.open(V).then(function(c){c.put(e.request,cp)})}return res}).catch(function(){return r});
return r||n}))});
