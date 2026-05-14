import type { Logger } from '../types';
export interface SessionLoopResolverDeps {
    loopService: {
        resolveLoopName(sessionId: string): string | null;
        getActiveState(name: string): {
            loopName: string;
            active: boolean;
            sandbox?: boolean;
            worktreeDir?: string;
        } | null;
        listActive(): Array<{
            loopName: string;
            worktreeDir: string;
            sandbox?: boolean;
            active: boolean;
        }>;
    };
    getParentSessionId(sessionId: string): Promise<string | null>;
    getSessionDirectory?(sessionId: string): Promise<string | null>;
    logger: Logger;
}
export interface ResolvedLoop {
    loopName: string;
    active: boolean;
    sandbox?: boolean;
    worktreeDir?: string;
}
export declare function createSessionLoopResolver(deps: SessionLoopResolverDeps): {
    resolveActiveLoopForSession(sessionId: string): Promise<ResolvedLoop | null>;
};
//# sourceMappingURL=session-loop-resolver.d.ts.map