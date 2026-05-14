import { tool } from '@opencode-ai/plugin';
import type { ToolContext } from './types';
export { createToolExecuteBeforeHook, createToolExecuteAfterHook, createPlanApprovalEventHook } from './plan-approval';
export type { ToolContext } from './types';
/**
 * Creates all plugin tools by combining review, plan, plan-execute, loop, and graph tools.
 *
 * @param ctx - Tool context with access to plugin services.
 * @returns Record of tool name to tool implementation.
 */
export declare function createTools(ctx: ToolContext): Record<string, ReturnType<typeof tool>>;
//# sourceMappingURL=index.d.ts.map