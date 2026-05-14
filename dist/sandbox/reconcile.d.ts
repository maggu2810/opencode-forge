/**
 * Sandbox reconciliation module for periodic container lifecycle management.
 *
 * This module provides a reconciliation function that ensures sandbox containers
 * are started/restored for loops that have sandbox enabled but no active container.
 * It is designed to be called periodically from the plugin server.
 */
import type { SandboxManager } from './manager';
import type { LoopService } from '../services/loop';
import type { Logger } from '../types';
export interface ReconcileSandboxesDeps {
    sandboxManager: SandboxManager;
    loopService: LoopService;
    logger: Logger;
}
/**
 * Reconciles sandbox containers with loop states.
 *
 * This function iterates through all active loops and ensures that:
 * 1. Loops with sandbox enabled have an active container
 * 2. Container names are persisted in loop state
 * 3. Stale container references are restored
 *
 * The function includes a re-entrancy guard to prevent concurrent executions.
 *
 * @param deps - Dependencies including sandbox manager, loop service, and logger
 * @returns Promise that resolves when reconciliation is complete
 */
export declare function reconcileSandboxes(deps: ReconcileSandboxesDeps): Promise<void>;
//# sourceMappingURL=reconcile.d.ts.map