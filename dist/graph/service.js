import { GraphClient } from './client';
import { ensureGraphDirectory, readGraphCacheMetadata, writeGraphCacheMetadata } from './database';
import { join, relative, dirname, isAbsolute } from 'path';
import { watch, existsSync } from 'fs';
import { collectIndexFingerprint } from './utils';
import { INDEXABLE_EXTENSIONS } from './constants';
import { IGNORED_DIRS, IGNORED_EXTS } from './utils';
const DEFAULT_DEBOUNCE_MS = 500;
/** Minimum number of files required to consider the graph for health check */
const MIN_FILES_FOR_HEALTH_CHECK = 50;
/** Minimum number of symbols required to consider the graph for health check */
const MIN_SYMBOLS_FOR_HEALTH_CHECK = 500;
/**
 * Evaluates graph health based on stats to detect obviously incomplete indexes.
 * Returns a description of the health issue if found, or null if healthy.
 *
 * Conservative heuristic: only treat the graph as incomplete when derived state is
 * missing for a large, symbol-dense index. Small or dependency-free repos can
 * validly have zero edges.
 */
function evaluateGraphHealth(stats) {
    // Only flag as incomplete for large, symbol-dense indexes with zero edges.
    // Smaller repos or those with standalone files can validly have no dependencies.
    if (stats.files >= MIN_FILES_FOR_HEALTH_CHECK &&
        stats.symbols >= MIN_SYMBOLS_FOR_HEALTH_CHECK &&
        stats.edges === 0 &&
        stats.calls === 0) {
        return `${stats.files} files and ${stats.symbols} symbols indexed but 0 dependency edges or call edges generated`;
    }
    return null;
}
/**
 * Determines whether a startup scan is needed based on cache freshness and health.
 */
async function determineStartupScan(dbPath, cwd, client) {
    if (!dbPath) {
        return { shouldScan: true, reason: 'Graph database path not set' };
    }
    const graphDir = dirname(dbPath);
    // 1. Check if metadata exists
    const metadata = readGraphCacheMetadata(graphDir);
    if (!metadata) {
        return { shouldScan: true, reason: 'Graph cache metadata missing' };
    }
    // 2. Check if graph DB has any indexed files
    try {
        const stats = await client.getStats();
        const hasIndexedFiles = stats.files > 0;
        // If metadata exists but graph has no files, scan is needed
        if (!hasIndexedFiles) {
            // Check if repo is non-empty
            const currentFingerprint = await collectIndexFingerprint(cwd, graphDir);
            if (currentFingerprint.fileCount > 0) {
                return { shouldScan: true, reason: 'Graph database empty but repository has files' };
            }
            // Empty repo - no scan needed
            return { shouldScan: false, reason: 'Repository is empty' };
        }
        // 3. Check persisted status for this scope
        // Note: We can't directly check KV here, so we rely on metadata and stats
        // 4. Compare current fingerprint to last successful scan
        const currentFingerprint = await collectIndexFingerprint(cwd, graphDir);
        // If fingerprint fields are missing from metadata (old format), scan to update
        if (metadata.indexedFileCount === undefined || metadata.indexedMaxMtimeMs === undefined) {
            return {
                shouldScan: true,
                reason: 'Graph metadata missing fingerprint fields - scanning to update'
            };
        }
        // If file count changed, scan is needed
        if (currentFingerprint.fileCount !== metadata.indexedFileCount) {
            return {
                shouldScan: true,
                reason: `File count changed: ${metadata.indexedFileCount} -> ${currentFingerprint.fileCount}`
            };
        }
        // If max mtime increased (files modified), scan is needed
        if (currentFingerprint.maxMtimeMs > metadata.indexedMaxMtimeMs) {
            return {
                shouldScan: true,
                reason: `Files modified since last index (mtime: ${metadata.indexedMaxMtimeMs} -> ${currentFingerprint.maxMtimeMs})`
            };
        }
        // 5. Check graph health - unhealthy graphs should be rescanned
        const healthIssue = evaluateGraphHealth(stats);
        if (healthIssue) {
            return {
                shouldScan: true,
                reason: `Graph cache unhealthy: ${healthIssue}`
            };
        }
        // 6. Cache is fresh and healthy - skip scan
        return {
            shouldScan: false,
            reason: `Graph cache fresh: ${stats.files} files, fingerprint matches last scan`
        };
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        return { shouldScan: true, reason: `Graph stats unavailable: ${msg}` };
    }
}
/**
 * Creates a graph service instance for code indexing and querying.
 *
 * @param config - Service configuration including project ID, data directory, and callbacks
 * @returns A GraphService instance for code graph operations
 */
export function createGraphService(config) {
    const { projectId, dataDir, cwd, logger, watch: watchEnabled, debounceMs, onStatusChange } = config;
    const client = new GraphClient();
    let dbPath = null;
    let initialized = false;
    let closing = false;
    let watcher = null;
    let flushTimer = null;
    const pendingQueue = new Map();
    let isFlushing = false;
    let watcherInitialized = false;
    let scanInFlight = null;
    const effectiveDebounceMs = debounceMs ?? DEFAULT_DEBOUNCE_MS;
    function emitStatus(state, stats, message) {
        if (onStatusChange) {
            onStatusChange(state, stats, message);
        }
    }
    function shouldIndexPath(absPath, relPath) {
        // Check if path is within project root
        if (!absPath.startsWith(cwd)) {
            return false;
        }
        // Check ignored directories
        const parts = relPath.split('/');
        if (parts.some(part => IGNORED_DIRS.has(part))) {
            return false;
        }
        // Check extension
        const ext = '.' + relPath.split('.').pop()?.toLowerCase();
        if (ext && IGNORED_EXTS.has(ext)) {
            return false;
        }
        // Check if extension is indexable
        if (ext && !(ext in INDEXABLE_EXTENSIONS)) {
            return false;
        }
        return true;
    }
    function normalizePath(absPath) {
        const relPath = relative(cwd, absPath);
        if (!shouldIndexPath(absPath, relPath)) {
            return null;
        }
        return { absPath, relPath };
    }
    let workerHealthy = true;
    async function ensureInit() {
        if (!initialized)
            await initialize();
    }
    async function flushQueue() {
        if (closing || isFlushing || pendingQueue.size === 0 || !workerHealthy) {
            if (!closing && !workerHealthy && pendingQueue.size > 0) {
                logger.debug('Graph flush skipped - worker unhealthy');
                pendingQueue.clear();
            }
            return;
        }
        isFlushing = true;
        const pathsToFlush = new Map(pendingQueue);
        pendingQueue.clear();
        try {
            for (const change of pathsToFlush.values()) {
                try {
                    await client.onFileChanged(change.absPath);
                    logger.debug(`Graph flushed: ${change.relPath}`);
                }
                catch (err) {
                    logger.error(`Failed to update graph for ${change.relPath}`, err);
                    workerHealthy = false;
                    client.markWorkerDead(err instanceof Error ? err : new Error(String(err)));
                    pendingQueue.clear();
                    // Persist error status to KV so TUI can display degraded state
                    const errorMessage = err instanceof Error ? err.message : String(err);
                    emitStatus('error', undefined, `Worker flush failed: ${errorMessage}`);
                    break;
                }
            }
            if (workerHealthy && initialized) {
                const stats = await client.getStats();
                // Evaluate graph health after flush
                const healthIssue = evaluateGraphHealth(stats);
                if (healthIssue) {
                    const errorMsg = `Graph index incomplete: ${healthIssue}. Run graph scan again or clear the cache.`;
                    emitStatus('error', {
                        files: stats.files,
                        symbols: stats.symbols,
                        edges: stats.edges,
                        calls: stats.calls,
                    }, errorMsg);
                    workerHealthy = false;
                }
                else {
                    emitStatus('ready', {
                        files: stats.files,
                        symbols: stats.symbols,
                        edges: stats.edges,
                        calls: stats.calls,
                    });
                }
            }
        }
        finally {
            isFlushing = false;
            // Check if new changes arrived during flush
            if (pendingQueue.size > 0 && workerHealthy) {
                scheduleFlush();
            }
        }
    }
    function scheduleFlush() {
        if (closing || flushTimer) {
            if (!closing && flushTimer) {
                clearTimeout(flushTimer);
                flushTimer = null; // Nullify immediately to prevent race conditions
            }
        }
        if (closing)
            return;
        flushTimer = setTimeout(() => {
            flushQueue().catch((err) => {
                logger.error('Graph flush failed', err);
            });
        }, effectiveDebounceMs);
    }
    function enqueueChange(absPath) {
        if (closing) {
            logger.debug(`Graph watcher: ignoring change during shutdown ${absPath}`);
            return;
        }
        const normalized = normalizePath(absPath);
        if (!normalized) {
            logger.debug(`Graph watcher: ignoring non-indexable path ${absPath}`);
            return;
        }
        const { absPath: normalizedAbs, relPath } = normalized;
        pendingQueue.set(normalizedAbs, {
            absPath: normalizedAbs,
            relPath,
            timestamp: Date.now(),
        });
        logger.debug(`Graph watcher: enqueued ${relPath}`);
        scheduleFlush();
    }
    function startWatcher() {
        if (!watchEnabled || watcherInitialized || closing) {
            return;
        }
        try {
            watcher = watch(cwd, { recursive: true }, (_eventType, filename) => {
                if (!filename)
                    return;
                const absPath = join(cwd, filename);
                enqueueChange(absPath);
            });
            watcherInitialized = true;
            logger.log('Graph filesystem watcher started');
        }
        catch (err) {
            logger.error('Failed to start graph filesystem watcher', err);
        }
    }
    function stopWatcher() {
        if (watcher) {
            watcher.close();
            watcher = null;
            watcherInitialized = false;
            logger.log('Graph filesystem watcher stopped');
        }
    }
    const service = {
        get ready() {
            return initialized && !closing && workerHealthy && client.isReady();
        },
        async scan() {
            // If a scan is already in flight, return the same promise (serialize concurrent requests)
            if (scanInFlight) {
                return scanInFlight;
            }
            await ensureInit();
            emitStatus('indexing');
            // Capture the scan promise for concurrent request handling
            scanInFlight = (async () => {
                try {
                    // Prepare scan - collect files and get batch info
                    const prepResult = await client.prepareScan();
                    // Process files in batches with progress updates
                    let offset = 0;
                    let completed = false;
                    while (!completed) {
                        const batchResult = await client.scanBatch(offset, prepResult.batchSize);
                        offset = batchResult.nextOffset;
                        completed = batchResult.completed;
                        // Emit progress during indexing
                        const progressMessage = `Indexing graph: ${offset}/${prepResult.totalFiles} files`;
                        emitStatus('indexing', undefined, progressMessage);
                    }
                    // Finalize - build derived state (PageRank, edges, call graph, etc.)
                    await client.finalizeScan();
                    const stats = await client.getStats();
                    // Evaluate graph health - detect obviously incomplete indexes
                    const healthIssue = evaluateGraphHealth(stats);
                    if (healthIssue) {
                        const errorMsg = `Graph index incomplete: ${healthIssue}. Run graph scan again or clear the cache.`;
                        emitStatus('error', {
                            files: stats.files,
                            symbols: stats.symbols,
                            edges: stats.edges,
                            calls: stats.calls,
                        }, errorMsg);
                        workerHealthy = false;
                        throw new Error(errorMsg);
                    }
                    // Persist fingerprint metadata for future startup freshness checks
                    if (dbPath) {
                        const graphDir = dirname(dbPath);
                        const currentFingerprint = await collectIndexFingerprint(cwd, graphDir);
                        writeGraphCacheMetadata(graphDir, {
                            lastIndexedAt: Date.now(),
                            indexedFileCount: currentFingerprint.fileCount,
                            indexedMaxMtimeMs: currentFingerprint.maxMtimeMs,
                        });
                    }
                    workerHealthy = true;
                    emitStatus('ready', {
                        files: stats.files,
                        symbols: stats.symbols,
                        edges: stats.edges,
                        calls: stats.calls,
                    });
                }
                catch (err) {
                    const msg = err instanceof Error ? err.message : String(err);
                    emitStatus('error', undefined, msg);
                    workerHealthy = false;
                    throw err;
                }
                finally {
                    scanInFlight = null;
                }
            })();
            return scanInFlight;
        },
        async close() {
            // Mark as closing to prevent new work from being queued
            closing = true;
            // Clear flush timer immediately
            if (flushTimer) {
                clearTimeout(flushTimer);
                flushTimer = null;
            }
            // Discard pending queue rather than flushing during shutdown
            pendingQueue.clear();
            // Stop watcher before more paths can be enqueued
            stopWatcher();
            // Close client (and its worker) — worker owns the DB handle
            await client.close();
            initialized = false;
            workerHealthy = false;
        },
        async getStats() {
            await ensureInit();
            return client.getStats();
        },
        async getTopFiles(limit = 20) {
            await ensureInit();
            return client.getTopFiles(limit);
        },
        async getFileDependents(relPath) {
            await ensureInit();
            return client.getFileDependents(validateRelativePath(relPath));
        },
        async getFileDependencies(relPath) {
            await ensureInit();
            return client.getFileDependencies(validateRelativePath(relPath));
        },
        async getFileCoChanges(relPath) {
            await ensureInit();
            return client.getFileCoChanges(validateRelativePath(relPath));
        },
        async getFileBlastRadius(relPath) {
            await ensureInit();
            return client.getFileBlastRadius(validateRelativePath(relPath));
        },
        async getFileSymbols(relPath) {
            await ensureInit();
            return client.getFileSymbols(validateRelativePath(relPath));
        },
        async findSymbols(name, limit = 50) {
            await ensureInit();
            return client.findSymbols(name, limit);
        },
        async searchSymbolsFts(query, limit = 20) {
            await ensureInit();
            return client.searchSymbolsFts(query, limit);
        },
        async getSymbolSignature(path, line) {
            await ensureInit();
            return client.getSymbolSignature(path, line);
        },
        async getCallers(path, line) {
            await ensureInit();
            return client.getCallers(path, line);
        },
        async getCallees(path, line) {
            await ensureInit();
            return client.getCallees(path, line);
        },
        async getUnusedExports(limit = 50, includeInternalOnly = false) {
            await ensureInit();
            return client.getUnusedExports(limit, includeInternalOnly);
        },
        async getDuplicateStructures(limit = 20) {
            await ensureInit();
            return client.getDuplicateStructures(limit);
        },
        async getNearDuplicates(threshold = 0.8, limit = 50) {
            await ensureInit();
            return client.getNearDuplicates(threshold, limit);
        },
        async getExternalPackages(limit = 50) {
            await ensureInit();
            return client.getExternalPackages(limit);
        },
        async getOrphanFiles(limit = 50) {
            await ensureInit();
            return client.getOrphanFiles(limit);
        },
        async getCircularDependencies(limit = 20) {
            await ensureInit();
            return client.getCircularDependencies(limit);
        },
        async getChangeImpact(paths, maxDepth = 5) {
            await ensureInit();
            return client.getChangeImpact(paths, maxDepth);
        },
        async getSymbolReferences(name, limit = 50) {
            await ensureInit();
            return client.getSymbolReferences(name, limit);
        },
        async render(opts) {
            await ensureInit();
            return client.render(opts);
        },
        onFileChanged(absPath) {
            if (closing) {
                logger.debug(`Graph service: ignoring file change during shutdown ${absPath}`);
                return;
            }
            enqueueChange(absPath);
        },
        async shouldScanOnStartup() {
            // Ensure initialization first (needed for client.getStats())
            await ensureInit();
            if (!dbPath) {
                return { shouldScan: true, reason: 'Graph database path not set' };
            }
            return determineStartupScan(dbPath, cwd, client);
        },
        async ensureStartupIndex() {
            // Ensure initialization first (sets dbPath and initializes client)
            await ensureInit();
            // Client is already initialized by this point
            const decision = await determineStartupScan(dbPath, cwd, client);
            if (decision.shouldScan) {
                logger.log(`Graph startup: ${decision.reason} - performing full scan`);
                await service.scan();
                return 'scanned';
            }
            else {
                logger.log(`Graph startup: ${decision.reason} - skipping scan`);
                // Refresh ready status with current stats
                const stats = await client.getStats();
                emitStatus('ready', {
                    files: stats.files,
                    symbols: stats.symbols,
                    edges: stats.edges,
                    calls: stats.calls,
                }, decision.reason);
                return 'skipped';
            }
        },
    };
    function resolveWorkerPath() {
        const isDev = import.meta.url.endsWith('.ts');
        const workerFile = isDev ? 'worker.ts' : 'worker.js';
        const workerUrl = new URL(`./${workerFile}`, import.meta.url);
        if (!existsSync(workerUrl.pathname)) {
            throw new Error(`Graph worker file not found: ${workerUrl.pathname}`);
        }
        return workerUrl.pathname;
    }
    function validateRelativePath(relPath) {
        const normalized = relPath.trim().replace(/\\/g, '/');
        if (!normalized) {
            throw new Error('Graph file path must be non-empty');
        }
        if (isAbsolute(normalized)) {
            throw new Error(`Graph file path must be relative: ${relPath}`);
        }
        if (normalized === '.' || normalized === '..' || normalized.startsWith('../') || normalized.includes('/../')) {
            throw new Error(`Graph file path must stay within project root: ${relPath}`);
        }
        return normalized;
    }
    async function initialize() {
        if (initialized)
            return;
        try {
            // Emit initializing status
            emitStatus('initializing');
            // Ensure graph directory exists; worker thread is the sole DB owner
            dbPath = ensureGraphDirectory(projectId, dataDir, cwd);
            // Create worker with explicit path resolution
            const workerPath = resolveWorkerPath();
            logger.debug(`Graph worker path: ${workerPath}`);
            const worker = new globalThis.Worker(workerPath, {
                env: {
                    GRAPH_DB_PATH: dbPath,
                    GRAPH_CWD: cwd,
                },
            });
            client.setWorker(worker, logger);
            await client.initialize({ cwd, dbPath, logger });
            initialized = true;
            workerHealthy = true;
            logger.log('Graph service initialized');
            logger.debug('Graph worker ready');
            // Start watcher after successful initialization
            if (watchEnabled) {
                startWatcher();
            }
        }
        catch (error) {
            initialized = false;
            workerHealthy = false;
            const msg = error instanceof Error ? error.message : String(error);
            logger.error('Failed to initialize graph service', error);
            emitStatus('error', undefined, msg);
            const err = new Error(`Graph service initialization failed: ${msg}`);
            err.cause = error;
            throw err;
        }
    }
    return service;
}
//# sourceMappingURL=service.js.map