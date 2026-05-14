import { Database } from 'bun:sqlite';
interface SqliteOpenOptions {
    /** Bootstrap schema (runs on every successful open — must be idempotent, e.g. CREATE TABLE IF NOT EXISTS). */
    bootstrap: (db: Database) => void;
    /** Pragmas to run after open and on fresh-db creation. */
    pragmas: string[];
    /** Human-readable label used in error logging (e.g. "Forge database" or "Graph database"). */
    label: string;
    /**
     * Optional additional validation after the integrity_check.
     * Throw to trigger corruption recovery. Called with the opened db.
     */
    validate?: (db: Database) => void;
    /**
     * Hook called before opening, for non-destructive cleanup of inconsistent
     * on-disk state (e.g. orphaned SHM files). Receives the dbPath.
     */
    preOpenCleanup?: (dbPath: string) => void;
    /**
     * When true, `createFreshDatabase` will `mkdirSync(dirname(dbPath), { recursive: true })`
     * before opening. Set false for callers that manage directory creation themselves.
     */
    ensureParentDir?: boolean;
}
/**
 * Opens a SQLite database with integrity verification and corruption recovery.
 *
 * - Runs `PRAGMA integrity_check` after open.
 * - Optionally runs a caller-supplied `validate` hook for deeper checks
 *   (e.g. exercising data pages — catches WAL-level corruption that
 *   integrity_check can miss).
 * - On integrity failure OR a corruption error during open, deletes the
 *   DB + WAL + SHM files and recreates a fresh database via `bootstrap`.
 * - Non-corruption errors during open are re-thrown for the caller to handle.
 */
export declare function openSqliteWithIntegrityGuard(dbPath: string, options: SqliteOpenOptions): Database;
/** Best-effort removal of an orphaned SHM file when its WAL sibling is missing. */
export declare function cleanupOrphanedShmFile(dbPath: string): void;
export {};
//# sourceMappingURL=sqlite-open.d.ts.map