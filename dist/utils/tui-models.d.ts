/**
 * TUI model selection helpers for fetching and managing available models.
 */
import type { TuiPluginApi } from '@opencode-ai/plugin/tui';
export interface ModelInfo {
    id: string;
    name: string;
    providerID: string;
    providerName: string;
    fullName: string;
    releaseDate?: string;
    capabilities?: {
        temperature?: boolean;
        toolcall?: boolean;
        reasoning?: boolean;
        attachment?: boolean;
    };
    cost?: {
        input?: number;
        output?: number;
    };
}
export interface ProviderInfo {
    id: string;
    name: string;
    models: ModelInfo[];
}
/**
 * Result of fetching available models, distinguishing success from failure.
 */
export interface FetchModelsResult {
    providers: ProviderInfo[];
    connectedProviderIds: string[];
    configuredProviderIds: string[];
    error?: string;
}
export interface ModelSortOptions {
    recents?: string[];
    connectedProviderIds?: string[];
    configuredProviderIds?: string[];
}
/**
 * Fetches all available providers and their models from the OpenCode API.
 * Returns a structured result that distinguishes between:
 * - Successful fetch with providers (may be empty if no providers have models)
 * - Failed fetch with an error message
 */
export declare function fetchAvailableModels(api: TuiPluginApi): Promise<FetchModelsResult>;
/**
 * Flattens providers into a single sorted list of models.
 * Uses sortModelsByPriority for ordering.
 */
export declare function flattenProviders(providers: ProviderInfo[]): ModelInfo[];
/**
 * Builds select options with a leading "Use default" entry.
 */
export declare function buildModelOptions(models: ModelInfo[]): Array<{
    name: string;
    value: string;
    description: string;
}>;
/**
 * Builds DialogSelect-compatible options with a Recent section
 * at the top, followed by all models grouped by provider.
 */
export declare function buildDialogSelectOptions(models: ModelInfo[], recents?: string[]): Array<{
    title: string;
    value: string;
    description?: string;
    category?: string;
}>;
/**
 * Returns a display label for a model value.
 * Shows the model name if found, "default" if empty, or the raw value as fallback.
 */
export declare function getModelDisplayLabel(value: string, models: ModelInfo[]): string;
/**
 * Resolves the selected index for a select component.
 * Returns the index of the matching model, or 0 (Use default) if not found.
 */
export declare function resolveModelSelectedIndex(options: Array<{
    value: string;
}>, selectedValue: string | undefined): number;
/**
 * Gets recently used models from TUI preferences.
 */
export declare function getRecentModels(projectId: string, dbPathOverride?: string): string[];
/**
 * Records a model as recently used. Pushes to front and deduplicates.
 */
export declare function recordRecentModel(projectId: string, modelFullName: string, dbPathOverride?: string): void;
/**
 * Sorts models by priority: recent first, then alphabetically.
 */
export declare function sortModelsByPriority(models: ModelInfo[], options?: ModelSortOptions): ModelInfo[];
//# sourceMappingURL=tui-models.d.ts.map