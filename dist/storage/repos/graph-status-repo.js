export function createGraphStatusRepo(db) {
    const stmtWrite = db.prepare(`
    INSERT INTO graph_status (project_id, cwd, state, ready, stats_json, message, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT (project_id, cwd) DO UPDATE SET
      state = excluded.state,
      ready = excluded.ready,
      stats_json = excluded.stats_json,
      message = excluded.message,
      updated_at = excluded.updated_at
  `);
    const stmtRead = db.prepare(`
    SELECT project_id, cwd, state, ready, stats_json, message, updated_at
    FROM graph_status
    WHERE project_id = ? AND cwd = ?
  `);
    function write(row) {
        const statsJson = row.stats ? JSON.stringify(row.stats) : null;
        stmtWrite.run(row.projectId, row.cwd, row.state, row.ready ? 1 : 0, statsJson, row.message, Date.now());
    }
    function read(projectId, cwd) {
        const row = stmtRead.get(projectId, cwd);
        if (!row)
            return null;
        return {
            projectId: row.project_id,
            cwd: row.cwd,
            state: row.state,
            ready: row.ready === 1,
            stats: row.stats_json ? JSON.parse(row.stats_json) : null,
            message: row.message,
            updatedAt: row.updated_at,
        };
    }
    return {
        write,
        read,
    };
}
//# sourceMappingURL=graph-status-repo.js.map