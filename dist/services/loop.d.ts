import type { Logger, LoopConfig } from '../types';
import type { OpencodeClient } from '@opencode-ai/sdk/v2';
import type { LoopsRepo, LoopRow, LoopLargeFields } from '../storage/repos/loops-repo';
import type { PlansRepo } from '../storage/repos/plans-repo';
import type { ReviewFindingsRepo, ReviewFindingRow } from '../storage/repos/review-findings-repo';
export declare const MAX_RETRIES = 3;
export declare const MAX_CONSECUTIVE_STALLS = 5;
/**
 * Represents the runtime state of an autonomous loop.
 */
export interface LoopState {
    active: boolean;
    sessionId: string;
    loopName: string;
    worktreeDir: string;
    projectDir?: string;
    worktreeBranch?: string;
    iteration: number;
    maxIterations: number;
    startedAt: string;
    prompt?: string;
    phase: 'coding' | 'auditing';
    audit: boolean;
    lastAuditResult?: string;
    errorCount: number;
    auditCount: number;
    terminationReason?: string;
    completedAt?: string;
    worktree?: boolean;
    modelFailed?: boolean;
    sandbox?: boolean;
    sandboxContainer?: string;
    completionSummary?: string;
    executionModel?: string;
    auditorModel?: string;
    workspaceId?: string;
    hostSessionId?: string;
}
export interface LoopService {
    getActiveState(name: string): LoopState | null;
    getAnyState(name: string): LoopState | null;
    setState(name: string, state: LoopState): void;
    deleteState(name: string): void;
    registerLoopSession(sessionId: string, loopName: string): void;
    resolveLoopName(sessionId: string): string | null;
    unregisterLoopSession(sessionId: string): void;
    buildContinuationPrompt(state: LoopState, auditFindings?: string): string;
    buildAuditPrompt(state: LoopState): string;
    listActive(): LoopState[];
    listRecent(): LoopState[];
    findMatchByName(name: string): {
        match: LoopState | null;
        candidates: LoopState[];
    };
    getStallTimeoutMs(): number;
    terminateAll(): void;
    reconcileStale(): number;
    hasOutstandingFindings(branch?: string, severity?: 'bug' | 'warning'): boolean;
    getOutstandingFindings(branch?: string, severity?: 'bug' | 'warning'): ReviewFindingRow[];
    generateUniqueLoopName(baseName: string): string;
    getPlanText(loopName: string, sessionId: string): string | null;
    incrementError(name: string): number;
    resetError(name: string): void;
    incrementAudit(name: string): number;
    setPhase(name: string, phase: 'coding' | 'auditing'): void;
    setPhaseAndResetError(name: string, phase: 'coding' | 'auditing'): void;
    setModelFailed(name: string, failed: boolean): void;
    setLastAuditResult(name: string, text: string | null): void;
    setSandboxContainer(name: string, containerName: string | null): void;
    setStatus(name: string, status: 'running' | 'completed' | 'cancelled' | 'errored' | 'stalled'): void;
    clearWorkspaceId(name: string): void;
    applyRotation(name: string, opts: {
        sessionId: string;
        iteration: number;
        phase?: 'coding' | 'auditing';
        auditCount?: number;
        lastAuditResult?: string | null;
        resetError?: boolean;
    }): void;
    terminate(name: string, opts: {
        status: 'completed' | 'cancelled' | 'errored' | 'stalled';
        reason: string;
        completedAt: number;
        summary?: string;
    }): void;
}
export declare function rowToLoopState(row: LoopRow, large: LoopLargeFields | null): LoopState;
export declare function createLoopService(loopsRepo: LoopsRepo, plansRepo: PlansRepo, reviewFindingsRepo: ReviewFindingsRepo, projectId: string, logger: Logger, loopConfig?: LoopConfig): LoopService;
export declare function generateUniqueName(baseName: string, existingNames: readonly string[]): string;
export interface LoopSessionOutput {
    messages: {
        text: string;
        cost: number;
        tokens: {
            input: number;
            output: number;
            reasoning: number;
            cacheRead: number;
            cacheWrite: number;
        };
    }[];
    totalCost: number;
    totalTokens: {
        input: number;
        output: number;
        reasoning: number;
        cacheRead: number;
        cacheWrite: number;
    };
    fileChanges: {
        additions: number;
        deletions: number;
        files: number;
    } | null;
}
export declare function fetchSessionOutput(v2Client: OpencodeClient, sessionId: string, directory: string, logger?: Logger): Promise<LoopSessionOutput | null>;
//# sourceMappingURL=loop.d.ts.map