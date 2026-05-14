import type { Permission } from '@opencode-ai/sdk';
import type { Logger } from '../types';
export interface PermissionAskDeps {
    resolver: {
        resolveActiveLoopForSession(sessionId: string): Promise<{
            loopName: string;
            active: boolean;
            sandbox?: boolean;
            worktreeDir?: string;
        } | null>;
    };
    logger: Logger;
}
export declare function createPermissionAskHandler(deps: PermissionAskDeps): (input: Permission, _output: {
    status?: "allow" | "deny" | "ask";
}) => Promise<void>;
//# sourceMappingURL=permission-ask.d.ts.map