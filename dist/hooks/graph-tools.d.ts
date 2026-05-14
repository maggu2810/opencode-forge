import type { Hooks } from '@opencode-ai/plugin';
import type { Logger } from '../types';
import type { GraphService } from '../graph';
interface GraphToolHookDeps {
    graphService: GraphService | null;
    logger: Logger;
    cwd: string;
}
/**
 * Map storing pre-command git revision snapshots keyed by callID.
 * Only populated for bash commands that are branch-change candidates.
 * Exported for testing purposes.
 */
export declare const pendingBranchSnapshots: Map<string, {
    cwd: string;
    branch: string | null;
    headRef: string | null;
}>;
/**
 * Determines whether a bash command is worth branch tracking.
 * Initial command set includes git branch-changing commands.
 * Excludes file restoration commands with explicit -- separator like `git checkout -- <path>`.
 * For bare `git checkout <arg>` without --, we conservatively track it and let the
 * after-hook compare pre/post branch state to determine if a rescan is needed.
 */
export declare function isBranchChangeCommand(args: unknown): boolean;
/**
 * Creates a before-hook for graph tool execution that captures pre-command branch state.
 * Only inspects bash tool calls that are branch-change candidates.
 */
export declare function createGraphToolBeforeHook(deps: GraphToolHookDeps): Hooks['tool.execute.before'];
export declare function createGraphToolAfterHook(deps: GraphToolHookDeps): Hooks['tool.execute.after'];
export {};
//# sourceMappingURL=graph-tools.d.ts.map