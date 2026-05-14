import { resolve } from 'path';
export function createSessionLoopResolver(deps) {
    return {
        async resolveActiveLoopForSession(sessionId) {
            const directLoopName = deps.loopService.resolveLoopName(sessionId);
            const directState = directLoopName ? deps.loopService.getActiveState(directLoopName) : null;
            deps.logger.debug(`[session-resolver] session=${sessionId} direct=${directLoopName ?? 'none'} parent=checking active=${directState?.loopName ?? 'none'}`);
            if (directState?.active)
                return directState;
            const parentId = await deps.getParentSessionId(sessionId);
            deps.logger.debug(`[session-resolver] session=${sessionId} direct=${directLoopName ?? 'none'} parent=${parentId ?? 'none'} active=${directState?.loopName ?? 'none'}`);
            if (parentId) {
                const parentLoopName = deps.loopService.resolveLoopName(parentId);
                const parentState = parentLoopName ? deps.loopService.getActiveState(parentLoopName) : null;
                if (parentState?.active) {
                    deps.logger.log(`[session-resolver] session=${sessionId} resolved via parent=${parentId} loop=${parentState.loopName}`);
                    return parentState;
                }
            }
            if (deps.getSessionDirectory) {
                const dir = await deps.getSessionDirectory(sessionId);
                if (dir) {
                    const normalized = resolve(dir);
                    for (const state of deps.loopService.listActive()) {
                        if (resolve(state.worktreeDir) === normalized) {
                            deps.logger.log(`[session-resolver] session=${sessionId} resolved via directory match loop=${state.loopName}`);
                            const full = deps.loopService.getActiveState(state.loopName);
                            if (full?.active)
                                return full;
                        }
                    }
                }
            }
            return null;
        },
    };
}
//# sourceMappingURL=session-loop-resolver.js.map