import type { Database } from 'bun:sqlite';
export interface GraphStatusRow {
    projectId: string;
    cwd: string;
    state: 'unavailable' | 'initializing' | 'indexing' | 'ready' | 'error';
    ready: boolean;
    stats: {
        files: number;
        symbols: number;
        edges: number;
        calls: number;
    } | null;
    message: string | null;
    updatedAt: number;
}
export interface GraphStatusRepo {
    write(row: Omit<GraphStatusRow, 'updatedAt'>): void;
    read(projectId: string, cwd: string): GraphStatusRow | null;
}
export declare function createGraphStatusRepo(db: Database): GraphStatusRepo;
//# sourceMappingURL=graph-status-repo.d.ts.map