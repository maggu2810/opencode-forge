import { forbidden, unauthorized } from './errors';
export function parseBasicAuth(header) {
    if (!header)
        return null;
    if (!header.startsWith('Basic ')) {
        return null;
    }
    try {
        const decoded = atob(header.slice(6));
        const colonIndex = decoded.indexOf(':');
        if (colonIndex === -1) {
            return null;
        }
        const password = decoded.slice(colonIndex + 1);
        return { password };
    }
    catch {
        return null;
    }
}
export function authenticate(req, cfg) {
    const authHeader = req.headers.get('Authorization');
    const parsed = parseBasicAuth(authHeader);
    // If password is configured, require it
    if (cfg.password) {
        if (!parsed) {
            throw unauthorized();
        }
        // Constant-time comparison where possible
        const expected = cfg.password;
        const provided = parsed.password;
        if (expected.length !== provided.length) {
            throw unauthorized();
        }
        // Simple constant-time comparison
        let diff = 0;
        for (let i = 0; i < expected.length; i++) {
            diff |= expected.charCodeAt(i) ^ provided.charCodeAt(i);
        }
        if (diff !== 0) {
            throw unauthorized();
        }
    }
    else {
        // No password configured
        if (!cfg.localhostOnly) {
            // Defensive: should be caught at server start
            throw forbidden('server requires password but none configured');
        }
        // localhost-only mode with no password: pass through
    }
}
//# sourceMappingURL=auth.js.map