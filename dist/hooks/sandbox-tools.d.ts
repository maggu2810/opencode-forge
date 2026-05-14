import type { Hooks } from '@opencode-ai/plugin';
import type { Logger } from '../types';
import type { SandboxContext } from '../sandbox/context';
interface SandboxToolHookDeps {
    resolveSandboxForSession: (sessionID: string) => Promise<SandboxContext | null>;
    logger: Logger;
}
export declare function createSandboxToolBeforeHook(deps: SandboxToolHookDeps): Hooks['tool.execute.before'];
export declare function createSandboxToolAfterHook(deps: SandboxToolHookDeps): Hooks['tool.execute.after'];
export {};
//# sourceMappingURL=sandbox-tools.d.ts.map