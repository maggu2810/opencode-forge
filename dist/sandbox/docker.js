import { spawn } from 'child_process';
export function createDockerService(logger) {
    const DEFAULT_TIMEOUT = 120000;
    function containerName(worktreeName) {
        return `oc-forge-sandbox-${worktreeName}`;
    }
    async function checkDocker() {
        try {
            const result = await execPromise('docker', ['info'], { timeout: 5000 });
            return result.exitCode === 0;
        }
        catch {
            return false;
        }
    }
    async function imageExists(image) {
        try {
            const result = await execPromise('docker', ['image', 'inspect', image], { timeout: 5000 });
            return result.exitCode === 0;
        }
        catch {
            return false;
        }
    }
    async function buildImage(dockerfilePath, tag) {
        return new Promise((resolve, reject) => {
            const child = spawn('docker', ['build', '-t', tag, dockerfilePath], {
                stdio: ['ignore', 'pipe', 'pipe'],
            });
            const stderr = [];
            child.stderr.on('data', (data) => {
                stderr.push(data.toString());
            });
            child.on('close', (code) => {
                if (code === 0) {
                    resolve();
                }
                else {
                    reject(new Error(`Docker build failed: ${stderr.join('')}`));
                }
            });
            child.on('error', reject);
        });
    }
    async function createContainer(name, projectDir, image, extraMounts) {
        const args = [
            'run',
            '-d',
            '--name',
            name,
            '-v',
            `${projectDir}:/workspace`,
        ];
        if (extraMounts) {
            for (const mount of extraMounts) {
                args.push('-v', mount);
            }
        }
        args.push('-w', '/workspace', image, 'sleep', 'infinity');
        const result = await execPromise('docker', args, { timeout: 30000 });
        if (result.exitCode !== 0) {
            throw new Error(`Failed to create container: ${result.stderr}`);
        }
    }
    async function removeContainer(name) {
        const result = await execPromise('docker', ['rm', '-f', name], { timeout: 30000 });
        if (result.exitCode !== 0 && !result.stderr.includes('No such container')) {
            throw new Error(`Failed to remove container: ${result.stderr}`);
        }
    }
    async function exec(name, command, opts) {
        const timeout = opts?.timeout ?? DEFAULT_TIMEOUT;
        const cwd = opts?.cwd;
        let fullCommand;
        if (cwd) {
            const safeCwd = cwd.replace(/'/g, "'\\''");
            fullCommand = `cd '${safeCwd}' && ${command}`;
        }
        else {
            fullCommand = command;
        }
        const args = ['exec', name, 'sh', '-c', fullCommand];
        return execPromise('docker', args, { timeout, streaming: true, abort: opts?.abort });
    }
    async function execPipe(name, command, stdin, opts) {
        return execPromise('docker', ['exec', '-i', name, 'sh', '-c', command], {
            timeout: opts?.timeout ?? DEFAULT_TIMEOUT,
            stdin,
            abort: opts?.abort,
        });
    }
    async function isRunning(name) {
        try {
            const result = await execPromise('docker', ['inspect', '--format={{.State.Running}}', name], {
                timeout: 5000,
            });
            return result.stdout.trim() === 'true';
        }
        catch {
            return false;
        }
    }
    async function listContainersByPrefix(prefix) {
        try {
            const result = await execPromise('docker', ['ps', '-a', '--filter', `name=${prefix}`, '--format', '{{.Names}}'], { timeout: 5000 });
            if (result.exitCode !== 0)
                return [];
            return result.stdout.trim().split('\n').filter(Boolean);
        }
        catch {
            return [];
        }
    }
    function execPromise(command, args, options) {
        const timeout = options?.timeout ?? DEFAULT_TIMEOUT;
        const cmdPreview = args.slice(-1)[0]?.slice(0, 80) ?? '';
        let hardDeadlineId;
        const inner = new Promise((resolve) => {
            const stdioConfig = options?.stdin ? 'pipe' : 'ignore';
            const child = spawn(command, args, {
                stdio: [stdioConfig, 'pipe', 'pipe'],
            });
            let stdout = '';
            let stderr = '';
            let timedOut = false;
            let settled = false;
            function settle(result) {
                if (settled)
                    return;
                settled = true;
                clearTimeout(timeoutId);
                clearTimeout(hardDeadlineId);
                resolve(result);
            }
            const timeoutId = setTimeout(() => {
                timedOut = true;
                logger.log(`[docker] timeout (${timeout}ms) for: ${cmdPreview}`);
                child.kill('SIGTERM');
                setTimeout(() => {
                    if (!settled) {
                        logger.log(`[docker] SIGKILL after SIGTERM for: ${cmdPreview}`);
                        child.kill('SIGKILL');
                    }
                }, 5000);
            }, timeout);
            if (options?.abort) {
                const onAbort = () => {
                    logger.log(`[docker] abort signal for: ${cmdPreview}`);
                    child.kill('SIGTERM');
                    setTimeout(() => {
                        if (!settled)
                            child.kill('SIGKILL');
                    }, 5000);
                };
                if (options.abort.aborted) {
                    onAbort();
                }
                else {
                    options.abort.addEventListener('abort', onAbort, { once: true });
                }
            }
            child.stdout.on('data', (data) => {
                stdout += data.toString();
            });
            child.stderr.on('data', (data) => {
                stderr += data.toString();
            });
            if (options?.stdin) {
                child.stdin.write(options.stdin);
                child.stdin.end();
            }
            child.on('close', (code) => {
                if (timedOut) {
                    logger.log(`[docker] close after timeout, code=${code} for: ${cmdPreview}`);
                }
                settle({
                    stdout,
                    stderr,
                    exitCode: timedOut ? 124 : (code ?? 1),
                });
            });
            child.on('error', (err) => {
                logger.log(`[docker] spawn error: ${err.message} for: ${cmdPreview}`);
                settle({
                    stdout,
                    stderr: stderr + err.message,
                    exitCode: 1,
                });
            });
        });
        const hardDeadline = timeout + 10_000;
        const deadlinePromise = new Promise((resolve) => {
            hardDeadlineId = setTimeout(() => {
                logger.log(`[docker] hard deadline (${hardDeadline}ms) hit for: ${cmdPreview}`);
                resolve({ stdout: '', stderr: `Command exceeded hard deadline of ${hardDeadline}ms`, exitCode: 124 });
            }, hardDeadline);
        });
        return Promise.race([inner, deadlinePromise]);
    }
    return {
        checkDocker,
        imageExists,
        buildImage,
        createContainer,
        removeContainer,
        exec,
        execPipe,
        isRunning,
        containerName,
        listContainersByPrefix,
    };
}
//# sourceMappingURL=docker.js.map