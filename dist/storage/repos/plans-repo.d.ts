import type { Database } from 'bun:sqlite';
export interface PlanRow {
    projectId: string;
    loopName: string | null;
    sessionId: string | null;
    content: string;
    updatedAt: number;
}
export interface PlansRepo {
    writeForSession(projectId: string, sessionId: string, content: string): void;
    writeForLoop(projectId: string, loopName: string, content: string): void;
    getForSession(projectId: string, sessionId: string): PlanRow | null;
    getForLoop(projectId: string, loopName: string): PlanRow | null;
    getForLoopOrSession(projectId: string, loopName: string, sessionId: string): PlanRow | null;
    promote(projectId: string, sessionId: string, loopName: string): boolean;
    deleteForSession(projectId: string, sessionId: string): void;
    deleteForLoop(projectId: string, loopName: string): void;
}
export declare function createPlansRepo(db: Database): PlansRepo;
//# sourceMappingURL=plans-repo.d.ts.map