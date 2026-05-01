type CacheEntry = {
  data: any;
  timestamp: number;
};

const cache = new Map<string, CacheEntry>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function apiFetch(endpoint: string): Promise<any> {
  const cacheKey = endpoint;
  const now = Date.now();

  // 1. Check in-memory cache
  const cached = cache.get(cacheKey);
  if (cached && now - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  // 2. Check sessionStorage
  if (typeof window !== "undefined") {
    const sessionData = sessionStorage.getItem(`api_cache:${cacheKey}`);
    if (sessionData) {
      try {
        const parsed = JSON.parse(sessionData);
        if (now - parsed.timestamp < CACHE_DURATION) {
          cache.set(cacheKey, parsed);
          return parsed.data;
        }
      } catch (e) {}
    }
  }

  // 3. Fetch from server – encode endpoint to preserve query strings
  const res = await fetch(
    `/api/server?endpoint=${encodeURIComponent(endpoint)}`,
  );
  if (!res.ok) throw new Error(`API Error: ${res.status}`);
  const data = await res.json();

  // 4. Store in cache
  const entry = { data, timestamp: now };
  cache.set(cacheKey, entry);
  if (typeof window !== "undefined") {
    sessionStorage.setItem(`api_cache:${cacheKey}`, JSON.stringify(entry));
  }

  return data;
}
