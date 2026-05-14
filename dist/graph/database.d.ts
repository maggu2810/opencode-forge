import { Database } from 'bun:sqlite';
import type { GraphScope } from './scope-types';
/**
 * Graph cache metadata structure stored in the metadata file
 */
export interface GraphCacheMetadata extends GraphScope {
    createdAt: number;
    /** Timestamp of the last successful full scan */
    lastIndexedAt?: number;
    /** Number of files indexed in the last successful full scan */
    indexedFileCount?: number;
    /** Maximum mtime of indexed files in the last successful full scan */
    indexedMaxMtimeMs?: number;
    /** Branch name at last successful index or branch switch */
    lastBranch?: string;
}
/**
 * Opens a managed graph database with integrity verification.
 * If integrity check fails or opening throws a corruption error, deletes the
 * corrupted DB files and recreates a fresh database.
 */
export declare function openGraphDatabase(dbPath: string): Database;
/**
 * Ensures the graph directory and metadata file exist, returning the database path.
 * Does NOT open a database connection — the worker thread is the sole DB owner.
 */
export declare function ensureGraphDirectory(projectId: string, dataDir: string, cwd?: string): string;
/**
 * Initialize the graph database with the full schema
 * Database location: <dataDir>/graph/<projectId::cwd-hash>/graph.db
 */
export declare function initializeGraphDatabase(projectId: string, dataDir: string, cwd?: string): Database;
/**
 * Reads graph cache metadata from a graph directory.
 *
 * @param graphDir - The graph cache directory path
 * @returns The metadata object or null if not found/readable
 */
export declare function readGraphCacheMetadata(graphDir: string): GraphCacheMetadata | null;
/**
 * Writes graph cache metadata to a graph directory.
 * Updates the metadata file with the provided fields, preserving existing data.
 *
 * @param graphDir - The graph cache directory path
 * @param metadata - The metadata fields to update
 * @returns true if successful, false otherwise
 */
export declare function writeGraphCacheMetadata(graphDir: string, metadata: Partial<GraphCacheMetadata>): boolean;
/**
 * Close all graph database instances
 */
export declare function closeGraphDatabase(): void;
//# sourceMappingURL=database.d.ts.map