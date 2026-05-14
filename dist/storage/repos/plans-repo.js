export function createPlansRepo(db) {
    const stmtWriteForSession = db.prepare(`
    INSERT OR REPLACE INTO plans (project_id, session_id, content, updated_at)
    VALUES (?, ?, ?, ?)
  `);
    const stmtWriteForLoop = db.prepare(`
    INSERT OR REPLACE INTO plans (project_id, loop_name, content, updated_at)
    VALUES (?, ?, ?, ?)
  `);
    const stmtGetForSession = db.prepare(`
    SELECT project_id, loop_name, session_id, content, updated_at
    FROM plans
    WHERE project_id = ? AND session_id = ?
  `);
    const stmtGetForLoop = db.prepare(`
    SELECT project_id, loop_name, session_id, content, updated_at
    FROM plans
    WHERE project_id = ? AND loop_name = ?
  `);
    const stmtPromote = db.prepare(`
    UPDATE plans
    SET loop_name = ?, session_id = NULL
    WHERE project_id = ? AND session_id = ?
  `);
    const stmtDeleteForSession = db.prepare(`
    DELETE FROM plans
    WHERE project_id = ? AND session_id = ?
  `);
    const stmtDeleteForLoop = db.prepare(`
    DELETE FROM plans
    WHERE project_id = ? AND loop_name = ?
  `);
    function writeForSession(projectId, sessionId, content) {
        stmtWriteForSession.run(projectId, sessionId, content, Date.now());
    }
    function writeForLoop(projectId, loopName, content) {
        stmtWriteForLoop.run(projectId, loopName, content, Date.now());
    }
    function getForSession(projectId, sessionId) {
        const row = stmtGetForSession.get(projectId, sessionId);
        if (!row)
            return null;
        return {
            projectId: row.project_id,
            loopName: row.loop_name,
            sessionId: row.session_id,
            content: row.content,
            updatedAt: row.updated_at,
        };
    }
    function getForLoop(projectId, loopName) {
        const row = stmtGetForLoop.get(projectId, loopName);
        if (!row)
            return null;
        return {
            projectId: row.project_id,
            loopName: row.loop_name,
            sessionId: row.session_id,
            content: row.content,
            updatedAt: row.updated_at,
        };
    }
    function getForLoopOrSession(projectId, loopName, sessionId) {
        return getForLoop(projectId, loopName) ?? getForSession(projectId, sessionId);
    }
    function promote(projectId, sessionId, loopName) {
        const result = stmtPromote.run(loopName, projectId, sessionId);
        return result.changes > 0;
    }
    function deleteForSession(projectId, sessionId) {
        stmtDeleteForSession.run(projectId, sessionId);
    }
    function deleteForLoop(projectId, loopName) {
        stmtDeleteForLoop.run(projectId, loopName);
    }
    return {
        writeForSession,
        writeForLoop,
        getForSession,
        getForLoop,
        getForLoopOrSession,
        promote,
        deleteForSession,
        deleteForLoop,
    };
}
//# sourceMappingURL=plans-repo.js.map