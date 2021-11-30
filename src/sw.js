const CACHE_NAME = "sw-cache-v1";

const clearCache = (async () => {
  const cache = await caches.open(CACHE_NAME);
  const storedRequests = await cache.keys();
  for (const req of storedRequests) {
    console.debug("delete from cache", req);
  }
})();

/** @type {RequestInit} */
const CORS = {
  mode: "no-cors",
  cache: "default",
  method: "GET",
};

/** @type {CacheQueryOptions}  */
const cacheQueryOptions = {
  ignoreMethod: true,
  ignoreSearch: true,
};

/**
 * Try get from server, if fail, try get from cache
 * @param {RequestInfo} url
 * @returns {Promise<Response>}
 */
const findSource = async (url) => {
  await clearCache;

  const urlStr = url.toString();
  const cache = await caches.open(CACHE_NAME);

  console.debug("findSource", url);

  if (urlStr.startsWith(location.origin)) {
    if (navigator.onLine) {
      if (!urlStr.endsWith(".html") && !urlStr.endsWith("/")) {
        console.debug("try cache", url);
        try {
          return await cache.match(url, cacheQueryOptions);
        } catch (e) {
          console.debug("cache error", e);
          console.debug("try fetch", url);
          const data = await fetch(url, CORS);
          await cache.put(url, data.clone());
          return data;
        }
      }

      console.debug("try fetch", url);
      const data = await fetch(url, CORS);
      await cache.put(url, data.clone());
      return data;
    } else {
      console.debug("offline, try cache", url);
      return await cache.match(url, cacheQueryOptions);
    }
  } else {
    console.debug("cross origin, try fetch", url);
    return await fetch(url, CORS);
  }
};

self.addEventListener("fetch", (event) => {
  // @ts-ignore
  event.waitUntil(findSource(event.request.url));
});