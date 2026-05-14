/**
 * Shared plan execution logic used by both the plan-execute tool and API handlers.
 */
import type { OpencodeClient } from '@opencode-ai/sdk/v2';
import type { Logger } from '../types';
export interface PlanExecutionParams {
    planText: string;
    title: string;
    directory: string;
    projectId: string;
    sessionId: string;
    executionModel?: string;
    v2: OpencodeClient;
    logger: Logger;
    mode: 'new-session' | 'execute-here';
    targetSessionId?: string;
}
export interface PlanExecutionResult {
    sessionId: string;
    modelUsed: string | null;
    mode: 'new-session' | 'execute-here';
}
export declare function runPlanExecution(params: PlanExecutionParams): Promise<PlanExecutionResult>;
//# sourceMappingURL=plan-execution-runner.d.ts.map