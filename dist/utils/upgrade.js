import { VERSION } from '../version';
import { homedir } from 'os';
import { join } from 'path';
import { existsSync, readFileSync, writeFileSync } from 'fs';
const VERSION_CACHE_TTL_MS = 5 * 60 * 1000;
let cachedVersion = null;
function resolveOpencodeCacheDir() {
    const xdgCacheHome = process.env['XDG_CACHE_HOME'] || join(homedir(), '.cache');
    return join(xdgCacheHome, 'opencode');
}
async function fetchLatestVersion() {
    if (cachedVersion && Date.now() < cachedVersion.expiresAt) {
        return cachedVersion.value;
    }
    try {
        const response = await fetch('https://registry.npmjs.org/opencode-forge/latest');
        if (!response.ok) {
            return null;
        }
        const data = await response.json();
        cachedVersion = { value: data.version, expiresAt: Date.now() + VERSION_CACHE_TTL_MS };
        return data.version;
    }
    catch {
        return null;
    }
}
function getCurrentVersion() {
    return VERSION;
}
function compareVersions(a, b) {
    const aParts = a.split('.').map(Number);
    const bParts = b.split('.').map(Number);
    for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
        const aNum = aParts[i] || 0;
        const bNum = bParts[i] || 0;
        if (aNum !== bNum) {
            return aNum - bNum;
        }
    }
    return 0;
}
export async function checkForUpdate() {
    const latest = await fetchLatestVersion();
    const current = getCurrentVersion();
    const updateAvailable = latest !== null && compareVersions(latest, current) > 0;
    return { current, latest, updateAvailable };
}
function updateCachePackageJson(cacheDir, version) {
    const packageJsonPath = join(cacheDir, 'package.json');
    if (!existsSync(packageJsonPath)) {
        return;
    }
    try {
        const content = readFileSync(packageJsonPath, 'utf-8');
        const packageJson = JSON.parse(content);
        if (packageJson.dependencies) {
            packageJson.dependencies['opencode-forge'] = version;
            writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf-8');
        }
    }
    catch {
    }
}
export async function performUpgrade(runInstall) {
    const checkResult = await checkForUpdate();
    const { current, latest } = checkResult;
    if (!latest || !checkResult.updateAvailable) {
        return {
            upgraded: false,
            from: current,
            to: current,
            message: 'Already on latest version',
        };
    }
    const cacheDir = resolveOpencodeCacheDir();
    if (!existsSync(cacheDir)) {
        return {
            upgraded: false,
            from: current,
            to: latest,
            message: 'OpenCode cache directory not found. Run OpenCode first to initialize the plugin.',
        };
    }
    const installResult = await runInstall(cacheDir, latest);
    if (installResult.exitCode !== 0) {
        return {
            upgraded: false,
            from: current,
            to: latest,
            message: `Upgrade failed: ${installResult.stderr || 'Unknown error'}`,
        };
    }
    updateCachePackageJson(cacheDir, latest);
    return {
        upgraded: true,
        from: current,
        to: latest,
        message: `Successfully upgraded from v${current} to v${latest}`,
    };
}
//# sourceMappingURL=upgrade.js.map