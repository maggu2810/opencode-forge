import { ok } from '../response';
import { notFound, badRequest, conflict } from '../errors';
import { parseJsonBody, PlanWriteBody, PlanPatchBody } from '../schemas';
import { applyPlanPatch } from '../../utils/plan-patch';
export async function handleGetSessionPlan(_req, deps, params) {
    const { projectId, sessionId } = params;
    const result = deps.ctx.plansRepo.getForSession(projectId, sessionId);
    if (!result) {
        throw notFound('plan not found');
    }
    return ok({
        sessionId: result.sessionId ?? undefined,
        loopName: result.loopName ?? undefined,
        content: result.content,
        updatedAt: result.updatedAt,
    });
}
export async function handleGetLoopPlan(_req, deps, params) {
    const { projectId, loopName } = params;
    const result = deps.ctx.plansRepo.getForLoop(projectId, loopName);
    if (!result) {
        throw notFound('plan not found');
    }
    return ok({
        sessionId: result.sessionId ?? undefined,
        loopName: result.loopName ?? undefined,
        content: result.content,
        updatedAt: result.updatedAt,
    });
}
export async function handleWriteSessionPlan(req, deps, params) {
    const { projectId, sessionId } = params;
    const body = await parseJsonBody(req, PlanWriteBody);
    deps.ctx.plansRepo.writeForSession(projectId, sessionId, body.content);
    return ok({ sessionId, content: body.content }, 201);
}
export async function handleWriteLoopPlan(req, deps, params) {
    const { projectId, loopName } = params;
    const body = await parseJsonBody(req, PlanWriteBody);
    deps.ctx.plansRepo.writeForLoop(projectId, loopName, body.content);
    return ok({ loopName, content: body.content }, 201);
}
export async function handlePatchSessionPlan(req, deps, params) {
    const { projectId, sessionId } = params;
    const body = await parseJsonBody(req, PlanPatchBody);
    const existing = deps.ctx.plansRepo.getForSession(projectId, sessionId);
    if (!existing) {
        throw notFound('plan not found');
    }
    const result = applyPlanPatch(existing.content, body.old_string, body.new_string);
    if (!result.success) {
        if (result.error?.includes('not found')) {
            throw notFound(result.error);
        }
        if (result.error?.includes('times')) {
            throw conflict(result.error || 'patch failed');
        }
        throw badRequest(result.error || 'patch failed');
    }
    deps.ctx.plansRepo.writeForSession(projectId, sessionId, result.updated);
    return ok({ sessionId, content: result.updated });
}
export async function handleDeleteSessionPlan(_req, deps, params) {
    const { projectId, sessionId } = params;
    deps.ctx.plansRepo.deleteForSession(projectId, sessionId);
    return ok({ deleted: true });
}
export async function handleDeleteLoopPlan(_req, deps, params) {
    const { projectId, loopName } = params;
    deps.ctx.plansRepo.deleteForLoop(projectId, loopName);
    return ok({ deleted: true });
}
//# sourceMappingURL=plans.js.map