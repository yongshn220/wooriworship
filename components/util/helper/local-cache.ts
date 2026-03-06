const DEFAULT_TTL_MS = 3 * 24 * 60 * 60 * 1000 // 3 days
const CACHE_PREFIX = "ww_cache:"

interface CacheEntry<T> {
    data: T
    expiresAt: number
}

export function getCached<T>(key: string): T | null {
    if (typeof window === "undefined") return null
    try {
        const raw = localStorage.getItem(CACHE_PREFIX + key)
        if (!raw) return null
        const entry: CacheEntry<T> = JSON.parse(raw)
        if (Date.now() > entry.expiresAt) {
            localStorage.removeItem(CACHE_PREFIX + key)
            return null
        }
        return entry.data
    } catch {
        return null
    }
}

export function setCache<T>(key: string, data: T, ttlMs: number = DEFAULT_TTL_MS): void {
    if (typeof window === "undefined") return
    try {
        const entry: CacheEntry<T> = { data, expiresAt: Date.now() + ttlMs }
        localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry))
    } catch {
        // localStorage full or unavailable — silently ignore
    }
}

export function invalidateCache(keyPrefix: string): void {
    if (typeof window === "undefined") return
    try {
        const fullPrefix = CACHE_PREFIX + keyPrefix
        const keysToRemove: string[] = []
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i)
            if (key?.startsWith(fullPrefix)) {
                keysToRemove.push(key)
            }
        }
        keysToRemove.forEach(k => localStorage.removeItem(k))
    } catch {
        // silently ignore
    }
}
