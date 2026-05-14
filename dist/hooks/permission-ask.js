export function createPermissionAskHandler(deps) {
    return async (input, _output) => {
        const patterns = Array.isArray(input.pattern) ? input.pattern : (input.pattern ? [input.pattern] : []);
        deps.logger.log(`[permission.ask] session=${input.sessionID} type=${input.type} patterns=[${patterns.join(', ')}]`);
        const state = await deps.resolver.resolveActiveLoopForSession(input.sessionID);
        if (!state) {
            deps.logger.log(`[permission.ask] unresolved session=${input.sessionID} — falling through`);
            return;
        }
        // Only apply permission checks to worktree loops (sandbox or non-sandbox worktrees)
        // In-place loops fall through to host default permissions
        const isWorktree = !!state.worktreeDir;
        if (!isWorktree) {
            deps.logger.log(`[permission.ask] loop=${state.loopName} is not a worktree loop — falling through to host default`);
            return;
        }
        // For worktree loops, we let opencode's core permission system handle all decisions
        // by not setting output.status. This prevents conflicts between the hook and
        // opencode's own ruleset evaluation which throws DeniedError.
        deps.logger.log(`[permission.ask] worktree loop=${state.loopName} — falling through to opencode default`);
        return;
    };
}
//# sourceMappingURL=permission-ask.js.map