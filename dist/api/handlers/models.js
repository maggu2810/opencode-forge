import { ok } from '../response';
import { parseJsonBody, ModelPrefsBody } from '../schemas';
import { fetchAvailableModels } from '../../utils/tui-models';
import { readExecutionPreferences, writeExecutionPreferences, } from '../../utils/tui-execution-preferences';
export async function handleListModels(_req, deps) {
    // Create a minimal TUI API shape for fetchAvailableModels
    const api = {
        client: deps.ctx.v2,
        state: {
            path: { directory: deps.ctx.directory },
            config: {},
        },
    };
    const result = await fetchAvailableModels(api);
    if (result.error) {
        return ok({
            providers: result.providers,
            error: result.error,
        });
    }
    return ok({
        providers: result.providers,
        connectedProviderIds: result.connectedProviderIds,
        configuredProviderIds: result.configuredProviderIds,
    });
}
export async function handleGetModelPreferences(_req, _deps, params) {
    const { projectId } = params;
    const prefs = readExecutionPreferences(projectId);
    if (!prefs) {
        throw new Error('preferences not found');
    }
    return ok(prefs);
}
export async function handleWriteModelPreferences(req, _deps, params) {
    const { projectId } = params;
    const body = await parseJsonBody(req, ModelPrefsBody);
    const prefs = {
        mode: body.mode ?? 'New session',
        executionModel: body.executionModel,
        auditorModel: body.auditorModel,
    };
    writeExecutionPreferences(projectId, prefs);
    return ok({ ok: true });
}
//# sourceMappingURL=models.js.map