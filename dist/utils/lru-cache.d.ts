/**
 * Generic bounded LRU cache keyed by string.
 * Relies on Map's insertion-order iteration: a get() re-inserts the key to mark it
 * as most-recently-used; on overflow the oldest key is evicted.
 *
 * Intentionally minimal: no TTL, no weak refs. Use for small hot-path caches
 * where unbounded growth is the concern.
 */
export declare class LRUCache<V> {
    private entries;
    private readonly maxSize;
    constructor(maxSize?: number);
    get(key: string): V | undefined;
    has(key: string): boolean;
    set(key: string, value: V): void;
    delete(key: string): boolean;
    clear(): void;
    get size(): number;
}
//# sourceMappingURL=lru-cache.d.ts.map