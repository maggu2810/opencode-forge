import type { DockerService } from './docker';
import type { PluginConfig } from '../types';
export interface SandboxContext {
    docker: DockerService;
    containerName: string;
    hostDir: string;
}
export declare function isSandboxEnabled(config: PluginConfig, sandboxManager: unknown): boolean;
//# sourceMappingURL=context.d.ts.map