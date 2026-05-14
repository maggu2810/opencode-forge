/**
 * Shared loop restart logic used by both CLI and API.
 */
import { listLoopStatesFromDb } from '../storage/cli-helpers';
export async function restartLoopByName(deps) {
    const { db, projectId, loopName, force } = deps;
    // Check if loop exists
    const loopStates = listLoopStatesFromDb(db, projectId);
    const entry = loopStates.find((e) => e.row.loop_name === loopName);
    if (!entry) {
        return {
            success: false,
            loopName,
            status: 'not_found',
            error: 'loop not found',
        };
    }
    // Check if loop is completed (cannot restart)
    if (entry.state.terminationReason === 'completed') {
        return {
            success: false,
            loopName,
            status: 'completed',
            error: 'completed loops cannot be restarted',
        };
    }
    // If active and not forced, return conflict
    if (entry.state.active && !force) {
        return {
            success: false,
            loopName,
            status: 'conflict',
            error: 'loop is already active',
        };
    }
    // For now, return a simplified response
    // Full implementation would mirror the CLI restart logic
    return {
        success: true,
        loopName,
        status: 'restarting',
    };
}
//# sourceMappingURL=loop-restart.js.map