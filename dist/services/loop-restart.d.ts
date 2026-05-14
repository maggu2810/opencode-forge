/**
 * Shared loop restart logic used by both CLI and API.
 */
import type { Database } from 'bun:sqlite';
export interface RestartLoopDeps {
    db: Database;
    projectId: string;
    loopName: string;
    force?: boolean;
}
export interface RestartLoopResult {
    success: boolean;
    loopName: string;
    status: string;
    sessionId?: string;
    error?: string;
}
export declare function restartLoopByName(deps: RestartLoopDeps): Promise<RestartLoopResult>;
//# sourceMappingURL=loop-restart.d.ts.map