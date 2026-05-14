import type { ToolContext } from './types';
import type { Hooks } from '@opencode-ai/plugin';
import { extractPlanTitle } from '../utils/plan-execution';
declare const LOOP_BLOCKED_TOOLS: Record<string, string>;
export { LOOP_BLOCKED_TOOLS };
export { extractPlanTitle };
export declare function createToolExecuteBeforeHook(ctx: ToolContext): Hooks['tool.execute.before'];
export declare function createToolExecuteAfterHook(ctx: ToolContext): Hooks['tool.execute.after'];
export declare function createPlanApprovalEventHook(ctx: ToolContext): (eventInput: {
    event: {
        type: string;
        properties?: Record<string, unknown>;
    };
}) => Promise<void>;
//# sourceMappingURL=plan-approval.d.ts.map