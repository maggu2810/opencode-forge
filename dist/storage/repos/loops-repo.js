import { findPartialMatch } from '../../utils/partial-match';
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
export function createLoopsRepo(db) {
    const insertStmt = db.prepare(`
    INSERT INTO loops (
      project_id, loop_name, status, current_session_id, worktree, worktree_dir,
      worktree_branch, project_dir, max_iterations, iteration, audit_count,
      error_count, phase, audit, execution_model, auditor_model,
      model_failed, sandbox, sandbox_container, started_at, completed_at,
      termination_reason, completion_summary, workspace_id, host_session_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
    const upsertLargeStmt = db.prepare(`
    INSERT INTO loop_large_fields (project_id, loop_name, prompt, last_audit_result)
    VALUES (?, ?, ?, ?)
    ON CONFLICT (project_id, loop_name) DO UPDATE SET
      prompt = excluded.prompt,
      last_audit_result = excluded.last_audit_result
  `);
    const getStmt = db.prepare(`
    SELECT project_id, loop_name, status, current_session_id, worktree, worktree_dir,
           worktree_branch, project_dir, max_iterations, iteration, audit_count,
           error_count, phase, audit, execution_model, auditor_model,
           model_failed, sandbox, sandbox_container, started_at, completed_at,
           termination_reason, completion_summary, workspace_id, host_session_id
    FROM loops
    WHERE project_id = ? AND loop_name = ?
  `);
    const getLargeStmt = db.prepare(`
    SELECT prompt, last_audit_result
    FROM loop_large_fields
    WHERE project_id = ? AND loop_name = ?
  `);
    const getBySessionIdStmt = db.prepare(`
    SELECT project_id, loop_name, status, current_session_id, worktree, worktree_dir,
           worktree_branch, project_dir, max_iterations, iteration, audit_count,
           error_count, phase, audit, execution_model, auditor_model,
           model_failed, sandbox, sandbox_container, started_at, completed_at,
           termination_reason, completion_summary, workspace_id, host_session_id
    FROM loops
    WHERE project_id = ? AND current_session_id = ?
  `);
    const listByStatusBase = `
    SELECT project_id, loop_name, status, current_session_id, worktree, worktree_dir,
           worktree_branch, project_dir, max_iterations, iteration, audit_count,
           error_count, phase, audit, execution_model, auditor_model,
           model_failed, sandbox, sandbox_container, started_at, completed_at,
           termination_reason, completion_summary, workspace_id, host_session_id
    FROM loops
    WHERE project_id = ? AND status IN
  `;
    const updatePhaseStmt = db.prepare(`
    UPDATE loops SET phase = ? WHERE project_id = ? AND loop_name = ?
  `);
    const updateIterationStmt = db.prepare(`
    UPDATE loops SET iteration = ? WHERE project_id = ? AND loop_name = ?
  `);
    const incrementErrorStmt = db.prepare(`
    UPDATE loops SET error_count = error_count + 1
    WHERE project_id = ? AND loop_name = ?
    RETURNING error_count
  `);
    const resetErrorStmt = db.prepare(`
    UPDATE loops SET error_count = 0, model_failed = 0
    WHERE project_id = ? AND loop_name = ?
  `);
    const incrementAuditStmt = db.prepare(`
    UPDATE loops SET audit_count = audit_count + 1
    WHERE project_id = ? AND loop_name = ?
    RETURNING audit_count
  `);
    const setAuditCountStmt = db.prepare(`
    UPDATE loops SET audit_count = ?
    WHERE project_id = ? AND loop_name = ?
  `);
    const setCurrentSessionIdStmt = db.prepare(`
    UPDATE loops SET current_session_id = ?
    WHERE project_id = ? AND loop_name = ?
  `);
    const setWorkspaceIdStmt = db.prepare(`
    UPDATE loops SET workspace_id = ?
    WHERE project_id = ? AND loop_name = ?
  `);
    const setHostSessionIdStmt = db.prepare(`
    UPDATE loops SET host_session_id = ?
    WHERE project_id = ? AND loop_name = ?
  `);
    const clearWorkspaceIdStmt = db.prepare(`
    UPDATE loops SET workspace_id = NULL
    WHERE project_id = ? AND loop_name = ?
  `);
    const setModelFailedStmt = db.prepare(`
    UPDATE loops SET model_failed = ?
    WHERE project_id = ? AND loop_name = ?
  `);
    const setLastAuditResultStmt = db.prepare(`
    UPDATE loop_large_fields SET last_audit_result = ?
    WHERE project_id = ? AND loop_name = ?
  `);
    const setSandboxContainerStmt = db.prepare(`
    UPDATE loops SET sandbox_container = ?
    WHERE project_id = ? AND loop_name = ?
  `);
    const setStatusStmt = db.prepare(`
    UPDATE loops SET status = ?
    WHERE project_id = ? AND loop_name = ?
  `);
    const updatePromptStmt = db.prepare(`
    UPDATE loop_large_fields
    SET prompt = ?
    WHERE project_id = ? AND loop_name = ?
  `);
    const setPhaseAndResetErrorStmt = db.prepare(`
    UPDATE loops SET phase = ?, error_count = 0, model_failed = 0
    WHERE project_id = ? AND loop_name = ?
  `);
    const applyRotationStmt = db.prepare(`
    UPDATE loops SET
      current_session_id = ?,
      iteration = ?,
      phase = COALESCE(?, phase),
      audit_count = COALESCE(?, audit_count)
    WHERE project_id = ? AND loop_name = ?
  `);
    const terminateStmt = db.prepare(`
    UPDATE loops SET
      status = ?,
      completed_at = ?,
      termination_reason = ?,
      completion_summary = ?
    WHERE project_id = ? AND loop_name = ?
  `);
    const deleteStmt = db.prepare(`
    DELETE FROM loops WHERE project_id = ? AND loop_name = ?
  `);
    const deleteLargeStmt = db.prepare(`
    DELETE FROM loop_large_fields WHERE project_id = ? AND loop_name = ?
  `);
    return {
        insert(row, large) {
            const result = insertStmt.run(row.projectId, row.loopName, row.status, row.currentSessionId, row.worktree ? 1 : 0, row.worktreeDir, row.worktreeBranch, row.projectDir, row.maxIterations, row.iteration, row.auditCount, row.errorCount, row.phase, row.audit ? 1 : 0, row.executionModel, row.auditorModel, row.modelFailed ? 1 : 0, row.sandbox ? 1 : 0, row.sandboxContainer, row.startedAt, row.completedAt, row.terminationReason, row.completionSummary, row.workspaceId, row.hostSessionId);
            if (result.changes === 0) {
                // Conflict - row already exists
                return false;
            }
            upsertLargeStmt.run(row.projectId, row.loopName, large.prompt, large.lastAuditResult);
            return true;
        },
        get(projectId, loopName) {
            const row = getStmt.get(projectId, loopName);
            return row ? mapRow(row) : null;
        },
        getLarge(projectId, loopName) {
            const row = getLargeStmt.get(projectId, loopName);
            if (!row)
                return null;
            return {
                prompt: row.prompt,
                lastAuditResult: row.last_audit_result,
            };
        },
        getBySessionId(projectId, sessionId) {
            const row = getBySessionIdStmt.get(projectId, sessionId);
            return row ? mapRow(row) : null;
        },
        listByStatus(projectId, statuses) {
            if (statuses.length === 0)
                return [];
            const placeholders = statuses.map(() => '?').join(',');
            const sql = `${listByStatusBase} (${placeholders}) ORDER BY started_at DESC`;
            const stmt = db.prepare(sql);
            const rows = stmt.all(projectId, ...statuses);
            return rows.map(mapRow);
        },
        updatePhase(projectId, loopName, phase) {
            updatePhaseStmt.run(phase, projectId, loopName);
        },
        updateIteration(projectId, loopName, iteration) {
            updateIterationStmt.run(iteration, projectId, loopName);
        },
        incrementError(projectId, loopName) {
            const result = incrementErrorStmt.get(projectId, loopName);
            return result?.error_count ?? 0;
        },
        resetError(projectId, loopName) {
            resetErrorStmt.run(projectId, loopName);
        },
        incrementAudit(projectId, loopName) {
            const result = incrementAuditStmt.get(projectId, loopName);
            return result?.audit_count ?? 0;
        },
        setAuditCount(projectId, loopName, count) {
            setAuditCountStmt.run(count, projectId, loopName);
        },
        setCurrentSessionId(projectId, loopName, sessionId) {
            setCurrentSessionIdStmt.run(sessionId, projectId, loopName);
        },
        setWorkspaceId(projectId, loopName, workspaceId) {
            setWorkspaceIdStmt.run(workspaceId, projectId, loopName);
        },
        setHostSessionId(projectId, loopName, hostSessionId) {
            setHostSessionIdStmt.run(hostSessionId, projectId, loopName);
        },
        clearWorkspaceId(projectId, loopName) {
            clearWorkspaceIdStmt.run(projectId, loopName);
        },
        setModelFailed(projectId, loopName, failed) {
            setModelFailedStmt.run(failed ? 1 : 0, projectId, loopName);
        },
        setLastAuditResult(projectId, loopName, text) {
            setLastAuditResultStmt.run(text, projectId, loopName);
        },
        setSandboxContainer(projectId, loopName, containerName) {
            setSandboxContainerStmt.run(containerName, projectId, loopName);
        },
        setPhaseAndResetError(projectId, loopName, phase) {
            setPhaseAndResetErrorStmt.run(phase, projectId, loopName);
        },
        setStatus(projectId, loopName, status) {
            setStatusStmt.run(status, projectId, loopName);
        },
        updatePrompt(projectId, loopName, prompt) {
            const result = updatePromptStmt.run(prompt, projectId, loopName);
            return result.changes > 0;
        },
        applyRotation(projectId, loopName, opts) {
            const runTxn = db.transaction(() => {
                applyRotationStmt.run(opts.sessionId, opts.iteration, opts.phase ?? null, opts.auditCount ?? null, projectId, loopName);
                if (opts.lastAuditResult !== undefined) {
                    setLastAuditResultStmt.run(opts.lastAuditResult ?? null, projectId, loopName);
                }
                if (opts.resetError) {
                    resetErrorStmt.run(projectId, loopName);
                }
            });
            runTxn();
        },
        terminate(projectId, loopName, opts) {
            terminateStmt.run(opts.status, opts.completedAt, opts.reason, opts.summary ?? null, projectId, loopName);
        },
        delete(projectId, loopName) {
            deleteStmt.run(projectId, loopName);
            deleteLargeStmt.run(projectId, loopName);
        },
        findPartial(projectId, name) {
            const all = this.listByStatus(projectId, ['running', 'completed', 'cancelled', 'errored', 'stalled']);
            return findPartialMatch(name, all, (row) => [row.loopName, row.worktreeBranch ?? undefined]);
        },
    };
}
//# sourceMappingURL=loops-repo.js.map