import type { SymbolKind } from './types';
/** Common directories to ignore when scanning */
export declare const IGNORED_DIRS: Set<string>;
/** File extensions to ignore */
export declare const IGNORED_EXTS: Set<string>;
interface CollectedFile {
    path: string;
    mtimeMs: number;
}
interface CollectResult {
    files: CollectedFile[];
    warning?: string;
}
/**
 * Collects a lightweight fingerprint of the repository for startup freshness checks.
 * Returns file count and max mtime without reading file contents.
 * Excludes the graph cache directory to avoid counting the metadata file itself.
 *
 * @param dir - Directory to fingerprint (usually cwd)
 * @param graphCacheDir - Optional graph cache directory to exclude. If not provided,
 *                        excludes common graph cache locations.
 * @returns Object with fileCount and maxMtimeMs
 */
export declare function collectIndexFingerprint(dir: string, graphCacheDir?: string): Promise<{
    fileCount: number;
    maxMtimeMs: number;
}>;
/**
 * Collect files from a directory - async version using git ls-files first
 */
export declare function collectFilesAsync(dir: string): Promise<CollectResult>;
/**
 * Check if file is a barrel file
 */
export declare function isBarrelFile(path: string): boolean;
/**
 * Extract signature from a line
 */
export declare function extractSignature(lines: string[], lineIdx: number, kind: string): string | null;
/**
 * Get kind tag prefix
 */
export declare function kindTag(kind: SymbolKind): string;
export {};
//# sourceMappingURL=utils.d.ts.map