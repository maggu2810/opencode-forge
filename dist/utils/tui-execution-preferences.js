/**
 * TUI execution preferences persistence for per-loop launch settings.
 *
 * This module provides helpers to read/write last-used execution preferences
 * from project KV, used only for dialog defaults - not for runtime behavior.
 */
import { Database } from 'bun:sqlite';
import { existsSync } from 'fs';
import { join } from 'path';
import { resolveDataDir, createTuiPrefsRepo } from '../storage';
const PREFERENCES_KEY = 'tui:plan-execution-preferences';
const TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
/**
 * Gets the database path used by the memory plugin.
 */
function getDbPath() {
    return join(resolveDataDir(), 'graph.db');
}
/**
 * Reads last-used execution preferences from TUI preferences.
 *
 * @param projectId - The project ID (git commit hash)
 * @param dbPathOverride - Optional database path override (for testing)
 * @returns The stored preferences or null if not found
 */
export function readExecutionPreferences(projectId, dbPathOverride) {
    const dbPath = dbPathOverride || getDbPath();
    if (!existsSync(dbPath))
        return null;
    let db = null;
    try {
        db = new Database(dbPath, { readonly: true });
        const repo = createTuiPrefsRepo(db);
        const stored = repo.get(projectId, PREFERENCES_KEY);
        if (!stored)
            return null;
        return {
            mode: stored.mode ?? 'Loop (worktree)',
            executionModel: stored.executionModel,
            auditorModel: stored.auditorModel,
        };
    }
    catch {
        return null;
    }
    finally {
        try {
            db?.close();
        }
        catch { }
    }
}
/**
 * Writes execution preferences to TUI preferences after successful launch.
 *
 * @param projectId - The project ID (git commit hash)
 * @param prefs - The preferences to persist
 * @param dbPathOverride - Optional database path override (for testing)
 * @returns true if successful, false otherwise
 */
export function writeExecutionPreferences(projectId, prefs, dbPathOverride) {
    const dbPath = dbPathOverride || getDbPath();
    if (!existsSync(dbPath))
        return false;
    let db = null;
    try {
        db = new Database(dbPath);
        db.run('PRAGMA busy_timeout=5000');
        const repo = createTuiPrefsRepo(db);
        repo.set(projectId, PREFERENCES_KEY, prefs, TTL_MS);
        return true;
    }
    catch {
        return false;
    }
    finally {
        try {
            db?.close();
        }
        catch { }
    }
}
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
export function resolveExecutionDialogDefaults(config, storedPrefs) {
    const mode = storedPrefs?.mode ?? 'Loop (worktree)';
    const executionModel = storedPrefs?.executionModel
        ?? config.loop?.model
        ?? config.executionModel
        ?? '';
    const auditorModel = storedPrefs?.auditorModel
        ?? config.auditorModel
        ?? storedPrefs?.executionModel
        ?? config.loop?.model
        ?? config.executionModel
        ?? '';
    return { mode, executionModel, auditorModel };
}
//# sourceMappingURL=tui-execution-preferences.js.map