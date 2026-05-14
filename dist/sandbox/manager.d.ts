import type { DockerService } from './docker';
import type { Logger } from '../types';
export interface SandboxManagerConfig {
    image: string;
}
export interface ActiveSandbox {
    containerName: string;
    projectDir: string;
    startedAt: string;
}
export interface SandboxManager {
    docker: DockerService;
    start(worktreeName: string, projectDir: string, startedAt?: string): Promise<{
        containerName: string;
    }>;
    stop(worktreeName: string): Promise<void>;
    getActive(worktreeName: string): ActiveSandbox | null;
    isActive(worktreeName: string): boolean;
    isLive(worktreeName: string): Promise<boolean>;
    cleanupOrphans(preserveWorktrees?: string[]): Promise<number>;
    restore(worktreeName: string, projectDir: string, startedAt: string): Promise<void>;
}
export declare function createSandboxManager(docker: DockerService, config: SandboxManagerConfig, logger: Logger): SandboxManager;
//# sourceMappingURL=manager.d.ts.map