import type { Database } from 'bun:sqlite';
export interface TuiPrefsRepo {
    get<T>(projectId: string, key: string): T | null;
    set<T>(projectId: string, key: string, value: T, ttlMs?: number): void;
}
/**
 * Creates a TuiPrefsRepo instance for managing TUI preferences.
 *
 * @param db - The database instance
 * @returns A TuiPrefsRepo with get/set methods
 */
export declare function createTuiPrefsRepo(db: Database): TuiPrefsRepo;
//# sourceMappingURL=tui-prefs-repo.d.ts.map