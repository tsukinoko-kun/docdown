const CACHE_NAME = "sw-cache-v1";

self.addEventListener("fetch", (event) => {
  // @ts-ignore
  event.respondWith(
    new Promise((resolve, reject) => {
      // @ts-ignore
      const url = event.request.url;

      fetch(url)
        .then((response) => {
          if (response.status >= 200 && response.status < 300) {
            if (url.beginsWith(self.location.origin)) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(url, response.clone());
              });
            }
            resolve(response);
          } else {
            reject(response);
          }
        })
        .catch(() => {
          caches.open(CACHE_NAME).then((cache) => {
            cache.match(url).then(resolve).catch(reject);
          });
        });
    })
  );
});
