import { createHash } from 'crypto';
export function hashProjectId(projectId) {
    return createHash('sha256').update(projectId).digest('hex').substring(0, 16);
}
export function hashGraphCacheScope(projectId, cwd) {
    const normalizedCwd = cwd.replace(/\/$/, '');
    return hashProjectId(`${projectId}::${normalizedCwd}`);
}
//# sourceMappingURL=scope-hash.js.map