type PermissionRule = {
    permission: string;
    pattern: string;
    action: 'allow' | 'deny';
};
/**
 * Builds the permission ruleset for loop sessions.
 *
 * - Worktree loops get a blanket allow-all (isolated environment), with
 *   more restrictive rules layered on top:
 *   - Worktree + sandbox: external_directory is allowed (no prompt)
 *   - Worktree + non-sandbox: external_directory is denied (no prompt)
 * - In-place loops omit the allow-all so the agent's own permissions apply,
 *   and no external_directory rule is added (OpenCode will ask by default).
 *
 * Per-agent tool restrictions are enforced by opencode's per-agent `tools` map
 * (see `src/config.ts`), not at the session level. This keeps subagents
 * (e.g., the auditor subtask) from inheriting restrictions intended only for
 * the primary agent.
 *
 * Worktree completion logs are written by the host session (see
 * `src/hooks/loop.ts` -> `writeWorktreeCompletionLog`), so the loop session
 * itself does not need an external_directory allow rule for the log path.
 */
export declare function buildLoopPermissionRuleset(options?: {
    isWorktree?: boolean;
    isSandbox?: boolean;
}): PermissionRule[];
export {};
//# sourceMappingURL=loop.d.ts.map