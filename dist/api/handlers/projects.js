import { ok } from '../response';
import { notFound } from '../errors';
import { Database } from 'bun:sqlite';
import { homedir, platform } from 'os';
import { join, basename } from 'path';
import { existsSync } from 'fs';
function withOpencodeProjectDb(fn) {
    try {
        const defaultBase = join(homedir(), platform() === 'win32' ? 'AppData' : '.local', 'share');
        const xdgDataHome = process.env['XDG_DATA_HOME'] || defaultBase;
        const opencodePath = join(xdgDataHome, 'opencode', 'opencode.db');
        if (!existsSync(opencodePath))
            return null;
        const db = new Database(opencodePath, { readonly: true });
        try {
            return fn(db);
        }
        finally {
            db.close();
        }
    }
    catch {
        return null;
    }
}
export function listKnownProjects() {
    const result = withOpencodeProjectDb((db) => {
        const rows = db.prepare('SELECT id, worktree FROM project').all();
        return rows.map((row) => ({
            id: row.id,
            name: basename(row.worktree),
        }));
    }) ?? [];
    return result;
}
export async function handleListProjects(_req, _deps) {
    const projects = listKnownProjects();
    return ok({ projects });
}
export async function handleGetProject(_req, deps, params) {
    const { projectId } = params;
    const { directory } = deps.ctx;
    // Verify the projectId matches the context
    if (projectId !== deps.ctx.projectId) {
        throw notFound('project not found');
    }
    return ok({ id: projectId, directory });
}
//# sourceMappingURL=projects.js.map