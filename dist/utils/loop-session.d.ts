import type { OpencodeClient } from '@opencode-ai/sdk/v2';
import type { Logger } from '../types';
import { buildLoopPermissionRuleset } from '../constants/loop';
interface CreateLoopSessionInput {
    v2: OpencodeClient;
    title: string;
    directory: string;
    permission: ReturnType<typeof buildLoopPermissionRuleset>;
    workspaceId?: string;
    logPrefix: string;
    logger: Logger | Console;
}
interface CreateLoopSessionResult {
    sessionId: string;
    boundWorkspaceId?: string;
    bindFailed: boolean;
}
export declare function createLoopSessionWithWorkspace(input: CreateLoopSessionInput): Promise<CreateLoopSessionResult | null>;
interface WorkspaceDetachedToastInput {
    v2: OpencodeClient;
    directory: string;
    loopName: string;
    variant?: 'warning';
    logger: Logger | Console;
    context?: string;
}
export declare function publishWorkspaceDetachedToast(input: WorkspaceDetachedToastInput): void;
export {};
//# sourceMappingURL=loop-session.d.ts.map