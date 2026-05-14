/**
 * Shared loop cancellation logic used by both CLI and API.
 */
import type { Database } from 'bun:sqlite';
export interface CancelLoopDeps {
    db: Database;
    projectId: string;
    loopName: string;
    cleanup?: boolean;
}
export interface CancelLoopResult {
    success: boolean;
    loopName: string;
    status: string;
    error?: string;
}
export declare function cancelLoopByName(deps: CancelLoopDeps): Promise<CancelLoopResult>;
//# sourceMappingURL=loop-cancel.d.ts.map