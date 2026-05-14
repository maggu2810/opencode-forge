import { createReviewTools } from './review';
import { createPlanTools } from './plan-kv';
import { createPlanExecuteTools } from './plan-execute';
import { createLoopTools } from './loop';
import { createGraphTools } from './graph';
export { createToolExecuteBeforeHook, createToolExecuteAfterHook, createPlanApprovalEventHook } from './plan-approval';
/**
 * Creates all plugin tools by combining review, plan, plan-execute, loop, and graph tools.
 *
 * @param ctx - Tool context with access to plugin services.
 * @returns Record of tool name to tool implementation.
 */
export function createTools(ctx) {
    return {
        ...createReviewTools(ctx),
        ...createPlanTools(ctx),
        ...createPlanExecuteTools(ctx),
        ...createLoopTools(ctx),
        ...createGraphTools(ctx),
    };
}
//# sourceMappingURL=index.js.map