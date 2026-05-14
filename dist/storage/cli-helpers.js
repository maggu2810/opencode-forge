import { rowToLoopState } from '../services/loop';
/**
 * Reads all loops from the loops table, optionally scoped to a projectId.
 * Returns LoopRow with LoopLargeFields for complete state reconstruction.
 */
function listLoopsFromDb(db, projectId, options) {
    const statuses = options?.statuses ?? ['running', 'completed', 'cancelled', 'errored', 'stalled'];
    const activeOnly = options?.activeOnly ?? false;
    const placeholders = statuses.map(() => '?').join(',');
    const baseQuery = `
    SELECT project_id, loop_name, status, current_session_id, worktree, worktree_dir,
           worktree_branch, project_dir, max_iterations, iteration, audit_count,
           error_count, phase, audit, execution_model, auditor_model,
           model_failed, sandbox, sandbox_container, started_at, completed_at,
           termination_reason, completion_summary, workspace_id, host_session_id
    FROM loops
    WHERE project_id = ? AND status IN (${placeholders})
  `;
    const params = [projectId ?? '', ...statuses];
    const rows = db.prepare(baseQuery).all(...params);
    const entries = [];
    for (const row of rows) {
        const loopRow = mapRow(row);
        if (activeOnly && loopRow.status !== 'running')
            continue;
        const large = db.prepare(`
      SELECT prompt, last_audit_result
      FROM loop_large_fields
      WHERE project_id = ? AND loop_name = ?
    `).get(loopRow.projectId, loopRow.loopName);
        entries.push({
            row: loopRow,
            large: large ? {
                prompt: large.prompt,
                lastAuditResult: large.last_audit_result,
            } : null,
        });
    }
    return entries;
}
export function listLoopStatesFromDb(db, projectId, options) {
    return listLoopsFromDb(db, projectId, options).map((entry) => ({
        state: rowToLoopState(entry.row, entry.large),
        row: { project_id: entry.row.projectId, loop_name: entry.row.loopName },
    }));
}
function mapRow(row) {
    return {
        projectId: row.project_id,
        loopName: row.loop_name,
        status: row.status,
        currentSessionId: row.current_session_id,
        worktree: row.worktree === 1,
        worktreeDir: row.worktree_dir,
        worktreeBranch: row.worktree_branch,
        projectDir: row.project_dir,
        maxIterations: row.max_iterations,
        iteration: row.iteration,
        auditCount: row.audit_count,
        errorCount: row.error_count,
        phase: row.phase,
        audit: row.audit === 1,
        executionModel: row.execution_model,
        auditorModel: row.auditor_model,
        modelFailed: row.model_failed === 1,
        sandbox: row.sandbox === 1,
        sandboxContainer: row.sandbox_container,
        startedAt: row.started_at,
        completedAt: row.completed_at,
        terminationReason: row.termination_reason,
        completionSummary: row.completion_summary,
        workspaceId: row.workspace_id,
        hostSessionId: row.host_session_id,
    };
}
//# sourceMappingURL=cli-helpers.js.map