type CacheEntry = {
  data: any;
  timestamp: number;
};

const cache = new Map<string, CacheEntry>();
const CACHE_DURATION = 45 * 1000; // 45 seconds

export async function apiFetch(endpoint: string): Promise<any> {
  // 1. Determine current locale from browser URL (client‑side only)
  let locale = "ar";
  if (typeof window !== "undefined") {
    const pathSegments = window.location.pathname.split("/");
    // The locale is the first segment (e.g., "ar" or "en")
    if (pathSegments.length > 1 && ["ar", "en"].includes(pathSegments[1])) {
      locale = pathSegments[1];
    }
  }

  // Cache key must include locale to avoid mixing Arabic and English data
  const cacheKey = `/${locale}:${endpoint}`;
  const now = Date.now();

  // 2. Check in-memory cache
  const cached = cache.get(cacheKey);
  if (cached && now - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }

  // 3. Check sessionStorage (client‑side)
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

  // 4. Fetch from server, passing the locale
  const res = await fetch(
    `/api/server?endpoint=${encodeURIComponent(endpoint)}&locale=${locale}`,
  );
  if (!res.ok) throw new Error(`API Error: ${res.status}`);
  const data = await res.json();

  // 5. Store in both caches
  const entry = { data, timestamp: now };
  cache.set(cacheKey, entry);
  if (typeof window !== "undefined") {
    sessionStorage.setItem(`api_cache:${cacheKey}`, JSON.stringify(entry));
  }

  return data;
}