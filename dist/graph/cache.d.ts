/**
 * File content cache keyed by absolute path, invalidated by mtime.
 * Avoids re-reading files that haven't changed.
 */
export declare class FileCache {
    private entries;
    private maxSize;
    constructor(maxSize?: number);
    get(filePath: string): Promise<string | null>;
    /** Manually set a cache entry */
    set(filePath: string, content: string, mtime?: number): void;
    /** Invalidate a specific file */
    invalidate(filePath: string): void;
    /** Clear entire cache */
    clear(): void;
}
//# sourceMappingURL=cache.d.ts.map