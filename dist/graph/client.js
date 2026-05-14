import { RpcClient } from './rpc';
/**
 * GraphClient communicates with the graph worker via RPC
 * All tree-sitter parsing and SQLite queries run in worker thread
 */
export class GraphClient {
    client = null;
    worker = null;
    ready = false;
    workerError = null;
    async initialize(_config) {
        // Worker will be created by service
        this.ready = true;
    }
    setWorker(worker, logger) {
        this.worker = worker;
        this.client = new RpcClient(worker, logger);
        this.client.on('error', (_error) => {
            this.ready = false;
            this.workerError = _error;
        });
        this.client.on('exit', () => {
            this.ready = false;
        });
    }
    markWorkerDead(error) {
        this.ready = false;
        if (error) {
            this.workerError = error;
        }
        if (this.client) {
            this.client.markTerminated();
        }
    }
    getWorkerError() {
        return this.workerError;
    }
    async scan() {
        if (!this.client)
            throw new Error('Graph client not initialized');
        await this.client.call('scan', []);
    }
    async prepareScan() {
        if (!this.client)
            throw new Error('Graph client not initialized');
        return this.client.call('prepareScan', []);
    }
    async scanBatch(offset, batchSize) {
        if (!this.client)
            throw new Error('Graph client not initialized');
        return this.client.call('scanBatch', [offset, batchSize]);
    }
    async finalizeScan() {
        if (!this.client)
            throw new Error('Graph client not initialized');
        await this.client.call('finalizeScan', []);
    }
    async getStats() {
        if (!this.client)
            throw new Error('Graph client not initialized');
        return this.client.call('getStats', []);
    }
    async getTopFiles(limit = 20) {
        if (!this.client)
            throw new Error('Graph client not initialized');
        return this.client.call('getTopFiles', [limit]);
    }
    async getFileDependents(relPath) {
        if (!this.client)
            throw new Error('Graph client not initialized');
        return this.client.call('getFileDependents', [relPath]);
    }
    async getFileDependencies(relPath) {
        if (!this.client)
            throw new Error('Graph client not initialized');
        return this.client.call('getFileDependencies', [relPath]);
    }
    async getFileCoChanges(relPath) {
        if (!this.client)
            throw new Error('Graph client not initialized');
        return this.client.call('getFileCoChanges', [relPath]);
    }
    async getFileBlastRadius(relPath) {
        if (!this.client)
            throw new Error('Graph client not initialized');
        return this.client.call('getFileBlastRadius', [relPath]);
    }
    async getFileSymbols(relPath) {
        if (!this.client)
            throw new Error('Graph client not initialized');
        return this.client.call('getFileSymbols', [relPath]);
    }
    async findSymbols(name, limit = 50) {
        if (!this.client)
            throw new Error('Graph client not initialized');
        return this.client.call('findSymbols', [name, limit]);
    }
    async searchSymbolsFts(query, limit = 20) {
        if (!this.client)
            throw new Error('Graph client not initialized');
        return this.client.call('searchSymbolsFts', [query, limit]);
    }
    async getSymbolSignature(path, line) {
        if (!this.client)
            throw new Error('Graph client not initialized');
        return this.client.call('getSymbolSignature', [path, line]);
    }
    async getCallers(path, line) {
        if (!this.client)
            throw new Error('Graph client not initialized');
        return this.client.call('getCallers', [path, line]);
    }
    async getCallees(path, line) {
        if (!this.client)
            throw new Error('Graph client not initialized');
        return this.client.call('getCallees', [path, line]);
    }
    async getUnusedExports(limit = 20, includeInternalOnly = false) {
        if (!this.client)
            throw new Error('Graph client not initialized');
        return this.client.call('getUnusedExports', [limit, includeInternalOnly]);
    }
    async getDuplicateStructures(limit = 20) {
        if (!this.client)
            throw new Error('Graph client not initialized');
        return this.client.call('getDuplicateStructures', [limit]);
    }
    async getNearDuplicates(threshold = 0.8, limit = 50) {
        if (!this.client)
            throw new Error('Graph client not initialized');
        return this.client.call('getNearDuplicates', [threshold, limit]);
    }
    async getExternalPackages(limit = 20) {
        if (!this.client)
            throw new Error('Graph client not initialized');
        return this.client.call('getExternalPackages', [limit]);
    }
    async render(opts) {
        if (!this.client)
            throw new Error('Graph client not initialized');
        return this.client.call('render', [opts]);
    }
    async getOrphanFiles(limit = 50) {
        if (!this.client)
            throw new Error('Graph client not initialized');
        return this.client.call('getOrphanFiles', [limit]);
    }
    async getCircularDependencies(limit = 20) {
        if (!this.client)
            throw new Error('Graph client not initialized');
        return this.client.call('getCircularDependencies', [limit]);
    }
    async getChangeImpact(paths, maxDepth = 5) {
        if (!this.client)
            throw new Error('Graph client not initialized');
        return this.client.call('getChangeImpact', [paths, maxDepth]);
    }
    async getSymbolReferences(name, limit = 50) {
        if (!this.client)
            throw new Error('Graph client not initialized');
        return this.client.call('getSymbolReferences', [name, limit]);
    }
    async onFileChanged(absPath) {
        if (!this.client)
            return;
        if (!this.ready) {
            throw new Error('Graph client not ready - worker may be unavailable');
        }
        await this.client.call('onFileChanged', [absPath]);
    }
    async close() {
        if (this.client) {
            this.client.terminate();
            this.client = null;
        }
        if (this.worker) {
            this.worker.terminate();
            this.worker = null;
        }
        this.ready = false;
    }
    isReady() {
        return this.ready;
    }
}
//# sourceMappingURL=client.js.map