import type { DockerService } from '../sandbox/docker';
import type { SandboxContext } from '../sandbox/context';
interface SandboxExecutionDeps {
    docker: DockerService;
    containerName: string;
    hostDir: string;
}
/**
 * Execute a glob pattern search inside a sandbox container.
 * Returns rewritten file paths with container paths converted back to host paths.
 */
export declare function executeSandboxGlob(sandbox: SandboxExecutionDeps, pattern: string, searchPath?: string): Promise<string>;
/**
 * Execute a grep/regex search inside a sandbox container.
 * Returns rewritten file paths with container paths converted back to host paths.
 */
export declare function executeSandboxGrep(sandbox: SandboxExecutionDeps, pattern: string, options?: {
    path?: string;
    include?: string;
}): Promise<string>;
export type { SandboxContext };
//# sourceMappingURL=sandbox-fs.d.ts.map