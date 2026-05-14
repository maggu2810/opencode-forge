/**
 * Graph command event hook for handling TUI command events.
 *
 * This module provides an event hook that listens for `tui.command.execute`
 * events and routes graph-related commands to the graph service.
 * This replaces the invalid shared-module bridge approach.
 */
import type { GraphService } from '../graph';
import type { Logger } from '../types';
export interface GraphCommandHookInput {
    event: {
        type: string;
        properties?: Record<string, unknown>;
    };
}
/**
 * Creates an event hook that handles TUI command execute events.
 *
 * When a `tui.command.execute` event is received with the `graph.scan` command,
 * this hook calls the graph service's scan method.
 *
 * @param graphService - The graph service instance (may be null if disabled)
 * @param logger - Logger for diagnostic output
 * @returns An async event handler function
 */
export declare function createGraphCommandEventHook(graphService: GraphService | null, logger: Logger): (input: GraphCommandHookInput) => Promise<void>;
//# sourceMappingURL=graph-command.d.ts.map