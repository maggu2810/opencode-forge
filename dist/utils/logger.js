import { appendFileSync, existsSync, mkdirSync, renameSync, statSync, writeFileSync } from 'fs';
import { dirname } from 'path';
const PREFIX = '[OpenCodeForge]';
const MAX_LOG_FILE_SIZE = 10 * 1024 * 1024;
export function slugify(text) {
    return text
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .substring(0, 50);
}
function ensureLogDir(filePath) {
    const dir = dirname(filePath);
    if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
    }
}
function checkFileSize(filePath) {
    try {
        const stats = statSync(filePath);
        if (stats.size > MAX_LOG_FILE_SIZE) {
            const backupPath = filePath + '.old';
            renameSync(filePath, backupPath);
            writeFileSync(filePath, '', 'utf-8');
        }
    }
    catch {
        // File doesn't exist yet, ignore
    }
}
export function createLogger(config) {
    const isEnabled = config.enabled;
    const isDebug = config.debug ?? false;
    if (!isEnabled) {
        return {
            log: (_message, ..._args) => { },
            error: (_message, ..._args) => { },
            debug: (_message, ..._args) => { },
        };
    }
    const filePath = config.file;
    ensureLogDir(filePath);
    function formatArg(arg) {
        if (arg === null)
            return 'null';
        if (arg === undefined)
            return 'undefined';
        if (arg instanceof Error) {
            return arg.stack ?? `${arg.name}: ${arg.message}`;
        }
        if (typeof arg === 'object') {
            try {
                return JSON.stringify(arg);
            }
            catch {
                return String(arg);
            }
        }
        return String(arg);
    }
    function write(level, message, args) {
        checkFileSize(filePath);
        const timestamp = new Date().toISOString();
        const formattedArgs = args.length > 0 ? ' ' + args.map(formatArg).join(' ') : '';
        const line = `${timestamp} ${level} ${PREFIX} ${message}${formattedArgs}\n`;
        try {
            appendFileSync(filePath, line, 'utf-8');
        }
        catch {
            // Silently fail if logging fails - don't crash the plugin
        }
    }
    return {
        log: (message, ...args) => {
            write('INFO', message, args);
        },
        error: (message, ...args) => {
            write('ERROR', message, args);
        },
        debug: isDebug
            ? (message, ...args) => {
                write('DEBUG', message, args);
            }
            : (_message, ..._args) => { },
    };
}
//# sourceMappingURL=logger.js.map