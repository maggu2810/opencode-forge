/**
 * TUI execution preferences persistence for per-loop launch settings.
 *
 * This module provides helpers to read/write last-used execution preferences
 * from project KV, used only for dialog defaults - not for runtime behavior.
 */
import type { PluginConfig } from '../types';
interface ExecutionPreferences {
    mode: 'New session' | 'Execute here' | 'Loop (worktree)' | 'Loop';
    executionModel?: string;
    auditorModel?: string;
}
/**
 * Reads last-used execution preferences from TUI preferences.
 *
 * @param projectId - The project ID (git commit hash)
 * @param dbPathOverride - Optional database path override (for testing)
 * @returns The stored preferences or null if not found
 */
export declare function readExecutionPreferences(projectId: string, dbPathOverride?: string): ExecutionPreferences | null;
/**
 * Writes execution preferences to TUI preferences after successful launch.
 *
 * @param projectId - The project ID (git commit hash)
 * @param prefs - The preferences to persist
 * @param dbPathOverride - Optional database path override (for testing)
 * @returns true if successful, false otherwise
 */
export declare function writeExecutionPreferences(projectId: string, prefs: ExecutionPreferences, dbPathOverride?: string): boolean;
/**
 * Resolves dialog defaults from last-used prefs first, then config fallbacks.
 *
 * Priority order for executionModel:
 * 1. stored.executionModel
 * 2. config.loop?.model
 * 3. config.executionModel
 *
 * Priority order for auditorModel:
 * 1. stored.auditorModel
 * 2. config.auditorModel
 * 3. stored.executionModel
 * 4. config.loop?.model
 * 5. config.executionModel
 *
 * @param config - Plugin config
 * @param storedPrefs - Last-used preferences from KV
 * @returns Resolved defaults for dialog pre-fill
 */
export declare function resolveExecutionDialogDefaults(config: PluginConfig, storedPrefs: ExecutionPreferences | null): {
    mode: string;
    executionModel: string;
    auditorModel: string;
};
export {};
//# sourceMappingURL=tui-execution-preferences.d.ts.map