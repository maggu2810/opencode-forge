export function createReviewFindingsRepo(db) {
    const stmtWrite = db.prepare(`
    INSERT INTO review_findings (project_id, file, line, severity, description, scenario, branch, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT (project_id, file, line) DO NOTHING
    RETURNING 1
  `);
    function toScenario(value) {
        if (value === undefined || value === '') {
            return null;
        }
        return value;
    }
    const stmtListAll = db.prepare(`
    SELECT project_id, file, line, severity, description, scenario, branch, created_at
    FROM review_findings
    WHERE project_id = ?
    ORDER BY file, line
  `);
    const stmtListByBranch = db.prepare(`
    SELECT project_id, file, line, severity, description, scenario, branch, created_at
    FROM review_findings
    WHERE project_id = ? AND (branch = ? OR (branch IS NULL AND ? IS NULL))
    ORDER BY file, line
  `);
    const stmtListByFile = db.prepare(`
    SELECT project_id, file, line, severity, description, scenario, branch, created_at
    FROM review_findings
    WHERE project_id = ? AND file = ?
    ORDER BY line
  `);
    const stmtDelete = db.prepare(`
    DELETE FROM review_findings
    WHERE project_id = ? AND file = ? AND line = ?
  `);
    function write(row) {
        const result = stmtWrite.run(row.projectId, row.file, row.line, row.severity, row.description, toScenario(row.scenario), row.branch, Date.now());
        if (result.changes > 0) {
            return { ok: true };
        }
        return { ok: false, conflict: true };
    }
    function listAll(projectId) {
        const rows = stmtListAll.all(projectId);
        return rows.map(row => ({
            projectId: row.project_id,
            file: row.file,
            line: row.line,
            severity: row.severity,
            description: row.description,
            scenario: row.scenario,
            branch: row.branch,
            createdAt: row.created_at,
        }));
    }
    function listByBranch(projectId, branch) {
        const rows = stmtListByBranch.all(projectId, branch, branch);
        return rows.map(row => ({
            projectId: row.project_id,
            file: row.file,
            line: row.line,
            severity: row.severity,
            description: row.description,
            scenario: row.scenario,
            branch: row.branch,
            createdAt: row.created_at,
        }));
    }
    function listByFile(projectId, file) {
        const rows = stmtListByFile.all(projectId, file);
        return rows.map(row => ({
            projectId: row.project_id,
            file: row.file,
            line: row.line,
            severity: row.severity,
            description: row.description,
            scenario: row.scenario,
            branch: row.branch,
            createdAt: row.created_at,
        }));
    }
    function deleteFinding(projectId, file, line) {
        const result = stmtDelete.run(projectId, file, line);
        return result.changes > 0;
    }
    return {
        write,
        listAll,
        listByBranch,
        listByFile,
        delete: deleteFinding,
    };
}
//# sourceMappingURL=review-findings-repo.js.map