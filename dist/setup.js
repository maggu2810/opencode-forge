import { readFileSync, existsSync, mkdirSync, copyFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { homedir, platform } from 'os';
import { resolveLogPath } from './storage';
function resolveBundledConfigPath() {
    const pluginDir = dirname(fileURLToPath(import.meta.url));
    return join(pluginDir, '..', 'forge-config.jsonc');
}
function resolveConfigDir() {
    const defaultBase = join(homedir(), platform() === 'win32' ? 'AppData' : '.config');
    const xdgConfigHome = process.env['XDG_CONFIG_HOME'] || defaultBase;
    return join(xdgConfigHome, 'opencode');
}
export function resolveConfigPath() {
    return join(resolveConfigDir(), 'forge-config.jsonc');
}
function resolveLegacyConfigPaths() {
    return [
        join(resolveConfigDir(), 'memory-config.jsonc'),
        join(resolveConfigDir(), 'graph-config.jsonc'),
    ];
}
function ensureGlobalConfig() {
    const configDir = resolveConfigDir();
    const newConfigPath = resolveConfigPath();
    if (existsSync(newConfigPath)) {
        return;
    }
    if (!existsSync(configDir)) {
        mkdirSync(configDir, { recursive: true });
    }
    for (const legacyConfigPath of resolveLegacyConfigPaths()) {
        if (existsSync(legacyConfigPath)) {
            copyFileSync(legacyConfigPath, newConfigPath);
            return;
        }
    }
    const bundledConfigPath = resolveBundledConfigPath();
    if (existsSync(bundledConfigPath)) {
        copyFileSync(bundledConfigPath, newConfigPath);
    }
}
function getDefaultConfig() {
    return {
        logging: {
            enabled: false,
            file: resolveLogPath(),
        },
    };
}
function isValidPluginConfig(config) {
    if (!config || typeof config !== 'object')
        return false;
    return true;
}
function stripComments(content) {
    let result = content;
    result = result.replace(/\/\*[\s\S]*?\*\//g, '');
    result = result.replace(/(^|[^:])(\/\/.*$)/gm, '$1');
    return result;
}
function stripTrailingCommas(content) {
    let result = content;
    result = result.replace(/,(\s*}[ \t\n\r]*)/g, '$1');
    result = result.replace(/,(\s*][ \t\n\r]*)/g, '$1');
    return result;
}
function parseJsonc(content) {
    const cleaned = stripComments(content);
    const normalized = stripTrailingCommas(cleaned);
    return JSON.parse(normalized);
}
export function loadPluginConfig() {
    ensureGlobalConfig();
    const configPath = resolveConfigPath();
    if (!existsSync(configPath)) {
        return getDefaultConfig();
    }
    try {
        const content = readFileSync(configPath, 'utf-8');
        const parsed = parseJsonc(content);
        if (!isValidPluginConfig(parsed)) {
            console.warn(`[forge] Invalid config at ${configPath}, using defaults`);
            return getDefaultConfig();
        }
        return normalizeConfig(parsed);
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.warn(`[forge] Failed to load config at ${configPath}: ${message}, using defaults`);
        return getDefaultConfig();
    }
}
function normalizeConfig(config) {
    // Emit deprecation warning before coalescing
    if (config.defaultKvTtlMs !== undefined && config.completedLoopTtlMs === undefined) {
        console.warn('[forge] Config: "defaultKvTtlMs" is deprecated, please rename to "completedLoopTtlMs". Compatibility shim will be removed in a future release.');
    }
    return {
        dataDir: config.dataDir,
        completedLoopTtlMs: config.completedLoopTtlMs ?? config.defaultKvTtlMs,
        logging: config.logging,
        compaction: config.compaction,
        messagesTransform: config.messagesTransform,
        executionModel: config.executionModel,
        auditorModel: config.auditorModel,
        loop: config.loop,
        tui: config.tui,
        agents: config.agents,
        sandbox: config.sandbox,
        graph: config.graph,
    };
}
//# sourceMappingURL=setup.js.map