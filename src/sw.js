const CACHE_NAME = "sw-cache-v1";

const clearCache = navigator.onLine
  ? (async () => {
      const cache = await caches.open(CACHE_NAME);
      const storedRequests = await cache.keys();
      for (const req of storedRequests) {
        await cache.delete(req);
      }
    })()
  : Promise.resolve();

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

  if (urlStr.startsWith(location.origin)) {
    if (navigator.onLine) {
      if (!urlStr.endsWith(".html") && !urlStr.endsWith("/")) {
        try {
          return await cache.match(url, cacheQueryOptions);
        } catch (e) {
          const data = await fetch(url, CORS);
          await cache.put(url, data.clone());
          return data;
        }
      }

      const data = await fetch(url, CORS);
      await cache.put(url, data.clone());
      return data;
    } else {
      return await cache.match(url, cacheQueryOptions);
    }
  } else {
    return await fetch(url, CORS);
  }
};

self.addEventListener("fetch", (event) => {
  // @ts-ignore
  event.waitUntil(findSource(event.request.url));
});
