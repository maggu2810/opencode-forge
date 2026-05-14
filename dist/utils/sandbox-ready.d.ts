/**
 * Sandbox readiness helper for TUI loop launches.
 *
 * This module provides a function to wait for a sandbox container to be ready
 * by polling the loops.sandbox_container field.
 */
export interface WaitForSandboxOptions {
    projectId: string;
    loopName: string;
    dbPath: string;
    pollMs?: number;
    timeoutMs?: number;
}
export type WaitForSandboxResult = {
    ready: true;
    containerName: string;
} | {
    ready: false;
    reason: 'timeout' | 'state_missing' | 'not_sandbox_enabled' | 'db_missing';
};
/**
 * Waits for a sandbox container to be ready by polling the loops table.
 *
 * This function polls the loops table for a loop's sandbox_container field,
 * which is written by the plugin server's sandbox reconciliation process.
 *
 * @param opts - Wait options including project ID, loop name, and timing
 * @returns Promise resolving to a WaitForSandboxResult
 */
export declare function waitForSandboxReady(opts: WaitForSandboxOptions): Promise<WaitForSandboxResult>;
//# sourceMappingURL=sandbox-ready.d.ts.map