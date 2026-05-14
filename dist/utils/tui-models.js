/**
 * TUI model selection helpers for fetching and managing available models.
 */
import { Database } from 'bun:sqlite';
import { existsSync } from 'fs';
import { join } from 'path';
import { resolveDataDir, createTuiPrefsRepo } from '../storage';
/**
 * Fetches all available providers and their models from the OpenCode API.
 * Returns a structured result that distinguishes between:
 * - Successful fetch with providers (may be empty if no providers have models)
 * - Failed fetch with an error message
 */
export async function fetchAvailableModels(api) {
    try {
        const directory = api.state.path.directory;
        const configuredProviderIds = Object.keys(api.state.config?.provider ?? {});
        const result = await api.client.provider.list({ directory });
        if (result.error) {
            const errorMsg = result.error?.message || 'Failed to fetch providers';
            const nestedErrorMsg = result.error?.data?.message;
            return {
                providers: [],
                connectedProviderIds: [],
                configuredProviderIds,
                error: nestedErrorMsg || errorMsg,
            };
        }
        if (!result.data) {
            return {
                providers: [],
                connectedProviderIds: [],
                configuredProviderIds,
                error: 'No provider data returned',
            };
        }
        const providers = [];
        const allModels = result.data.all || [];
        for (const provider of allModels) {
            const models = [];
            if (provider.models) {
                for (const modelData of Object.values(provider.models)) {
                    models.push({
                        id: modelData.id,
                        name: modelData.name,
                        providerID: provider.id,
                        providerName: provider.name,
                        fullName: `${provider.id}/${modelData.id}`,
                        releaseDate: modelData.release_date,
                        capabilities: {
                            temperature: modelData.capabilities?.temperature,
                            toolcall: modelData.capabilities?.toolcall,
                            reasoning: modelData.capabilities?.reasoning,
                            attachment: modelData.capabilities?.attachment,
                        },
                        cost: modelData.cost,
                    });
                }
            }
            providers.push({
                id: provider.id,
                name: provider.name,
                models,
            });
        }
        return {
            providers,
            connectedProviderIds: result.data.connected || [],
            configuredProviderIds,
        };
    }
    catch (err) {
        return {
            providers: [],
            connectedProviderIds: [],
            configuredProviderIds: Object.keys(api.state.config?.provider ?? {}),
            error: err instanceof Error ? err.message : 'Failed to fetch providers'
        };
    }
}
/**
 * Flattens providers into a single sorted list of models.
 * Uses sortModelsByPriority for ordering.
 */
export function flattenProviders(providers) {
    const allModels = [];
    for (const provider of providers) {
        allModels.push(...provider.models);
    }
    // Sort alphabetically by name (recents not used here)
    return sortModelsByPriority(allModels, {});
}
/**
 * Builds select options with a leading "Use default" entry.
 */
export function buildModelOptions(models) {
    const defaultOption = {
        name: 'Use default',
        value: '',
        description: 'Use config default model',
    };
    const modelOptions = models.map(m => ({
        name: m.name,
        value: m.fullName,
        description: `${m.providerName} - ${m.capabilities?.reasoning ? 'Reasoning, ' : ''}${m.capabilities?.toolcall ? 'Tools' : 'No tools'}`,
    }));
    return [defaultOption, ...modelOptions];
}
/**
 * Builds DialogSelect-compatible options with a Recent section
 * at the top, followed by all models grouped by provider.
 */
export function buildDialogSelectOptions(models, recents = []) {
    const defaultOption = {
        title: 'Use default',
        value: '',
        description: 'Use config default model',
    };
    const modelMap = new Map(models.map(m => [m.fullName, m]));
    const usedInSections = new Set();
    const recentOptions = recents
        .filter(fn => !usedInSections.has(fn))
        .map(fn => modelMap.get(fn))
        .filter((m) => !!m)
        .map(m => {
        usedInSections.add(m.fullName);
        return {
            title: m.name,
            value: m.fullName,
            description: m.providerName,
            category: 'Recent',
        };
    });
    const providerOptions = models
        .filter(m => !usedInSections.has(m.fullName))
        .map(m => ({
        title: m.name,
        value: m.fullName,
        description: m.capabilities?.reasoning ? 'Reasoning' : undefined,
        category: m.providerName,
    }));
    return [defaultOption, ...recentOptions, ...providerOptions];
}
/**
 * Returns a display label for a model value.
 * Shows the model name if found, "default" if empty, or the raw value as fallback.
 */
export function getModelDisplayLabel(value, models) {
    if (!value)
        return 'default';
    const model = models.find(m => m.fullName === value);
    return model ? model.name : value;
}
/**
 * Resolves the selected index for a select component.
 * Returns the index of the matching model, or 0 (Use default) if not found.
 */
export function resolveModelSelectedIndex(options, selectedValue) {
    if (!selectedValue) {
        return 0; // Default to "Use default"
    }
    const index = options.findIndex(opt => opt.value === selectedValue);
    return index >= 0 ? index : 0; // Fall back to "Use default" if not found
}
const RECENT_MODELS_KEY = 'tui:model-recents';
const RECENT_MODELS_MAX = 10;
const RECENT_MODELS_TTL_MS = 90 * 24 * 60 * 60 * 1000; // 90 days
function getDbPath() {
    return join(resolveDataDir(), 'graph.db');
}
/**
 * Gets recently used models from TUI preferences.
 */
export function getRecentModels(projectId, dbPathOverride) {
    const dbPath = dbPathOverride || getDbPath();
    if (!existsSync(dbPath))
        return [];
    let db = null;
    try {
        db = new Database(dbPath, { readonly: true });
        const repo = createTuiPrefsRepo(db);
        const stored = repo.get(projectId, RECENT_MODELS_KEY);
        return stored && Array.isArray(stored) ? stored : [];
    }
    catch {
        return [];
    }
    finally {
        try {
            db?.close();
        }
        catch { }
    }
}
/**
 * Records a model as recently used. Pushes to front and deduplicates.
 */
export function recordRecentModel(projectId, modelFullName, dbPathOverride) {
    if (!modelFullName)
        return;
    const dbPath = dbPathOverride || getDbPath();
    if (!existsSync(dbPath))
        return;
    let db = null;
    try {
        db = new Database(dbPath);
        db.run('PRAGMA busy_timeout=5000');
        const repo = createTuiPrefsRepo(db);
        const existing = getRecentModels(projectId, dbPath);
        const updated = [modelFullName, ...existing.filter(m => m !== modelFullName)].slice(0, RECENT_MODELS_MAX);
        repo.set(projectId, RECENT_MODELS_KEY, updated, RECENT_MODELS_TTL_MS);
    }
    catch {
        // silent
    }
    finally {
        try {
            db?.close();
        }
        catch { }
    }
}
/**
 * Sorts models by priority: recent first, then alphabetically.
 */
export function sortModelsByPriority(models, options = {}) {
    const recentSet = new Set(options.recents ?? []);
    const connectedProviderSet = new Set(options.connectedProviderIds ?? []);
    const configuredProviderSet = new Set(options.configuredProviderIds ?? []);
    const getProviderPriority = (model) => {
        if (connectedProviderSet.has(model.providerID))
            return 0;
        if (configuredProviderSet.has(model.providerID))
            return 1;
        return 2;
    };
    return models.sort((a, b) => {
        const aIsRecent = recentSet.has(a.fullName);
        const bIsRecent = recentSet.has(b.fullName);
        // Recents first
        if (aIsRecent && !bIsRecent)
            return -1;
        if (!aIsRecent && bIsRecent)
            return 1;
        // Then connected providers, then configured providers
        const providerPriorityDiff = getProviderPriority(a) - getProviderPriority(b);
        if (providerPriorityDiff !== 0)
            return providerPriorityDiff;
        // Then group providers alphabetically
        const providerNameDiff = a.providerName.localeCompare(b.providerName);
        if (providerNameDiff !== 0)
            return providerNameDiff;
        // Then alphabetically by name
        return a.name.localeCompare(b.name);
    });
}
//# sourceMappingURL=tui-models.js.map