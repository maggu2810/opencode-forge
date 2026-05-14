import { resolve } from 'path';
import { spawnSync } from 'child_process';
export function createSandboxManager(docker, config, logger) {
    const activeSandboxes = new Map();
    function detectGitMount(projectDir) {
        try {
            const result = spawnSync('git', ['rev-parse', '--git-common-dir'], {
                cwd: projectDir,
                encoding: 'utf-8',
            });
            if (result.status !== 0 || !result.stdout)
                return [];
            const gitCommonDir = resolve(projectDir, result.stdout.trim());
            // If the git dir is already inside the project dir being mounted, no extra mount needed
            if (gitCommonDir.startsWith(projectDir + '/'))
                return [];
            return [`${gitCommonDir}:${gitCommonDir}:ro`];
        }
        catch {
            logger.log(`[sandbox] could not detect git common dir for ${projectDir}, skipping extra mount`);
            return [];
        }
    }
    async function start(worktreeName, projectDir, startedAt) {
        const dockerAvailable = await docker.checkDocker();
        if (!dockerAvailable) {
            throw new Error('Docker is not available. Please ensure Docker is running.');
        }
        const imageExists = await docker.imageExists(config.image);
        if (!imageExists) {
            throw new Error(`Docker image "${config.image}" not found. Build it first:\n` +
                `  docker build -t ${config.image} container/`);
        }
        const containerName = docker.containerName(worktreeName);
        const absoluteProjectDir = resolve(projectDir);
        const running = await docker.isRunning(containerName);
        if (running) {
            logger.log(`Sandbox container ${containerName} already running`);
            activeSandboxes.set(worktreeName, {
                containerName,
                projectDir: absoluteProjectDir,
                startedAt: startedAt ?? new Date().toISOString(),
            });
            return { containerName };
        }
        const extraMounts = detectGitMount(absoluteProjectDir);
        if (extraMounts.length > 0) {
            logger.log(`Sandbox: mounting git common dir: ${extraMounts[0]}`);
        }
        logger.log(`Creating sandbox container ${containerName} for ${absoluteProjectDir}`);
        await docker.createContainer(containerName, absoluteProjectDir, config.image, extraMounts);
        const active = {
            containerName,
            projectDir: absoluteProjectDir,
            startedAt: startedAt ?? new Date().toISOString(),
        };
        activeSandboxes.set(worktreeName, active);
        logger.log(`Sandbox container ${containerName} started`);
        return { containerName };
    }
    async function stop(worktreeName) {
        const active = activeSandboxes.get(worktreeName);
        const containerName = active?.containerName || docker.containerName(worktreeName);
        try {
            await docker.removeContainer(containerName);
            logger.log(`Sandbox container ${containerName} removed`);
        }
        catch (err) {
            const errMsg = err instanceof Error ? err.message : String(err);
            logger.log(`Sandbox container ${containerName} removal: ${errMsg}`);
        }
        finally {
            activeSandboxes.delete(worktreeName);
        }
    }
    function getActive(worktreeName) {
        return activeSandboxes.get(worktreeName) || null;
    }
    function isActive(worktreeName) {
        return activeSandboxes.has(worktreeName);
    }
    async function isLive(worktreeName) {
        const active = activeSandboxes.get(worktreeName);
        if (!active) {
            return false;
        }
        const containerName = active.containerName;
        const running = await docker.isRunning(containerName);
        if (!running) {
            // Container is not running in Docker - remove stale map entry
            logger.log(`Sandbox: container ${containerName} not found in Docker, removing stale map entry for ${worktreeName}`);
            activeSandboxes.delete(worktreeName);
            return false;
        }
        return true;
    }
    async function cleanupOrphans(preserveWorktrees) {
        const containers = await docker.listContainersByPrefix('oc-forge-sandbox-');
        let removed = 0;
        const preserveSet = preserveWorktrees
            ? new Set(preserveWorktrees.map((wt) => docker.containerName(wt)))
            : new Set();
        for (const name of containers) {
            if (preserveSet.has(name)) {
                continue;
            }
            try {
                await docker.removeContainer(name);
                removed++;
                logger.log(`Removed orphaned sandbox container: ${name}`);
            }
            catch (err) {
                const errMsg = err instanceof Error ? err.message : String(err);
                logger.error(`Failed to remove orphaned sandbox container ${name}: ${errMsg}`);
            }
        }
        if (!preserveWorktrees) {
            activeSandboxes.clear();
        }
        else {
            for (const key of activeSandboxes.keys()) {
                if (!preserveWorktrees.includes(key)) {
                    activeSandboxes.delete(key);
                }
            }
        }
        return removed;
    }
    async function restore(worktreeName, projectDir, startedAt) {
        const containerName = docker.containerName(worktreeName);
        const running = await docker.isRunning(containerName);
        if (running) {
            logger.log(`Sandbox container ${containerName} already running, repopulating map`);
            activeSandboxes.set(worktreeName, { containerName, projectDir: resolve(projectDir), startedAt });
        }
        else {
            logger.log(`Sandbox container ${containerName} not running, starting new container`);
            await start(worktreeName, projectDir, startedAt);
        }
    }
    return {
        docker,
        start,
        stop,
        getActive,
        isActive,
        isLive,
        cleanupOrphans,
        restore,
    };
}
//# sourceMappingURL=manager.js.map