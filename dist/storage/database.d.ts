import { Database } from 'bun:sqlite';
export declare function resolveDataDir(): string;
export declare function resolveLogPath(): string;
interface ForgeDatabaseOptions {
    completedLoopTtlMs?: number;
}
export declare function openForgeDatabase(dbPath: string, options?: ForgeDatabaseOptions): Database;
export declare function initializeDatabase(dataDir: string, options?: ForgeDatabaseOptions): Database;
export declare function closeDatabase(db: Database): void;
export {};
//# sourceMappingURL=database.d.ts.map