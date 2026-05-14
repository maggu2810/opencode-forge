/**
 * Generic bounded LRU cache keyed by string.
 * Relies on Map's insertion-order iteration: a get() re-inserts the key to mark it
 * as most-recently-used; on overflow the oldest key is evicted.
 *
 * Intentionally minimal: no TTL, no weak refs. Use for small hot-path caches
 * where unbounded growth is the concern.
 */
export class LRUCache {
    entries = new Map();
    maxSize;
    constructor(maxSize = 500) {
        if (maxSize <= 0)
            throw new Error('LRUCache maxSize must be > 0');
        this.maxSize = maxSize;
    }
    get(key) {
        const value = this.entries.get(key);
        if (value === undefined && !this.entries.has(key))
            return undefined;
        // Re-insert to mark as most recently used
        this.entries.delete(key);
        this.entries.set(key, value);
        return value;
    }
    has(key) {
        return this.entries.has(key);
    }
    set(key, value) {
        if (this.entries.has(key)) {
            this.entries.delete(key);
        }
        else if (this.entries.size >= this.maxSize) {
            const oldest = this.entries.keys().next();
            if (!oldest.done) {
                this.entries.delete(oldest.value);
            }
        }
        this.entries.set(key, value);
    }
    delete(key) {
        return this.entries.delete(key);
    }
    clear() {
        this.entries.clear();
    }
    get size() {
        return this.entries.size;
    }
}
//# sourceMappingURL=lru-cache.js.map