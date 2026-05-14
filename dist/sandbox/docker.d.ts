import type { Logger } from '../types';
export interface DockerExecOpts {
    timeout?: number;
    cwd?: string;
    abort?: AbortSignal;
    stdin?: string;
}
export interface DockerExecResult {
    stdout: string;
    stderr: string;
    exitCode: number;
}
export interface DockerService {
    checkDocker(): Promise<boolean>;
    imageExists(image: string): Promise<boolean>;
    buildImage(dockerfilePath: string, tag: string): Promise<void>;
    createContainer(name: string, projectDir: string, image: string, extraMounts?: string[]): Promise<void>;
    removeContainer(name: string): Promise<void>;
    exec(name: string, command: string, opts?: DockerExecOpts): Promise<DockerExecResult>;
    execPipe(name: string, command: string, stdin: string, opts?: {
        timeout?: number;
        abort?: AbortSignal;
    }): Promise<DockerExecResult>;
    isRunning(name: string): Promise<boolean>;
    containerName(worktreeName: string): string;
    listContainersByPrefix(prefix: string): Promise<string[]>;
}
export declare function createDockerService(logger: Logger): DockerService;
//# sourceMappingURL=docker.d.ts.map