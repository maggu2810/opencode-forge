import type { Database } from 'bun:sqlite';
export interface LoopRow {
    projectId: string;
    loopName: string;
    status: 'running' | 'completed' | 'cancelled' | 'errored' | 'stalled';
    currentSessionId: string;
    worktree: boolean;
    worktreeDir: string;
    worktreeBranch: string | null;
    projectDir: string;
    maxIterations: number;
    iteration: number;
    auditCount: number;
    errorCount: number;
    phase: 'coding' | 'auditing';
    audit: boolean;
    executionModel: string | null;
    auditorModel: string | null;
    modelFailed: boolean;
    sandbox: boolean;
    sandboxContainer: string | null;
    startedAt: number;
    completedAt: number | null;
    terminationReason: string | null;
    completionSummary: string | null;
    workspaceId: string | null;
    hostSessionId: string | null;
}
export interface LoopLargeFields {
    prompt: string | null;
    lastAuditResult: string | null;
}
export interface LoopsRepo {
    insert(row: LoopRow, large: LoopLargeFields): boolean;
    get(projectId: string, loopName: string): LoopRow | null;
    getLarge(projectId: string, loopName: string): LoopLargeFields | null;
    getBySessionId(projectId: string, sessionId: string): LoopRow | null;
    listByStatus(projectId: string, statuses: LoopRow['status'][]): LoopRow[];
    updatePhase(projectId: string, loopName: string, phase: 'coding' | 'auditing'): void;
    updateIteration(projectId: string, loopName: string, iteration: number): void;
    incrementError(projectId: string, loopName: string): number;
    resetError(projectId: string, loopName: string): void;
    incrementAudit(projectId: string, loopName: string): number;
    setAuditCount(projectId: string, loopName: string, count: number): void;
    setCurrentSessionId(projectId: string, loopName: string, sessionId: string): void;
    setWorkspaceId(projectId: string, loopName: string, workspaceId: string): void;
    setHostSessionId(projectId: string, loopName: string, hostSessionId: string): void;
    clearWorkspaceId(projectId: string, loopName: string): void;
    setModelFailed(projectId: string, loopName: string, failed: boolean): void;
    setLastAuditResult(projectId: string, loopName: string, text: string | null): void;
    setSandboxContainer(projectId: string, loopName: string, containerName: string | null): void;
    setPhaseAndResetError(projectId: string, loopName: string, phase: 'coding' | 'auditing'): void;
    setStatus(projectId: string, loopName: string, status: LoopRow['status']): void;
    updatePrompt(projectId: string, loopName: string, prompt: string): boolean;
    applyRotation(projectId: string, loopName: string, opts: {
        sessionId: string;
        iteration: number;
        phase?: 'coding' | 'auditing';
        auditCount?: number;
        lastAuditResult?: string | null;
        resetError?: boolean;
    }): void;
    terminate(projectId: string, loopName: string, opts: {
        status: Exclude<LoopRow['status'], 'running'>;
        reason: string;
        completedAt: number;
        summary?: string;
    }): void;
    delete(projectId: string, loopName: string): void;
    findPartial(projectId: string, name: string): {
        match: LoopRow | null;
        candidates: LoopRow[];
    };
}
export declare function createLoopsRepo(db: Database): LoopsRepo;
//# sourceMappingURL=loops-repo.d.ts.map