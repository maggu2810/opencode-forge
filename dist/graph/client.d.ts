import type { GraphStats, TopFileResult, FileDepResult, FileCoChangeResult, FileSymbolResult, SymbolSearchResult, SymbolSignatureResult, CallerResult, CalleeResult, UnusedExportResult, DuplicateStructureResult, NearDuplicateResult, ExternalPackageResult, PrepareScanResult, ScanBatchResult, OrphanFileResult, CircularDependencyResult, ChangeImpactResult, SymbolReferenceResult } from './types';
import type { Logger } from '../types';
interface GraphWorkerConfig {
    cwd: string;
    dbPath: string;
    logger?: Logger;
}
/**
 * GraphClient communicates with the graph worker via RPC
 * All tree-sitter parsing and SQLite queries run in worker thread
 */
export declare class GraphClient {
    private client;
    private worker;
    private ready;
    private workerError;
    initialize(_config: GraphWorkerConfig): Promise<void>;
    setWorker(worker: Worker, logger?: Logger): void;
    markWorkerDead(error?: Error): void;
    getWorkerError(): Error | null;
    scan(): Promise<void>;
    prepareScan(): Promise<PrepareScanResult>;
    scanBatch(offset: number, batchSize: number): Promise<ScanBatchResult>;
    finalizeScan(): Promise<void>;
    getStats(): Promise<GraphStats>;
    getTopFiles(limit?: number): Promise<TopFileResult[]>;
    getFileDependents(relPath: string): Promise<FileDepResult[]>;
    getFileDependencies(relPath: string): Promise<FileDepResult[]>;
    getFileCoChanges(relPath: string): Promise<FileCoChangeResult[]>;
    getFileBlastRadius(relPath: string): Promise<number>;
    getFileSymbols(relPath: string): Promise<FileSymbolResult[]>;
    findSymbols(name: string, limit?: number): Promise<SymbolSearchResult[]>;
    searchSymbolsFts(query: string, limit?: number): Promise<SymbolSearchResult[]>;
    getSymbolSignature(path: string, line: number): Promise<SymbolSignatureResult | null>;
    getCallers(path: string, line: number): Promise<CallerResult[]>;
    getCallees(path: string, line: number): Promise<CalleeResult[]>;
    getUnusedExports(limit?: number, includeInternalOnly?: boolean): Promise<UnusedExportResult[]>;
    getDuplicateStructures(limit?: number): Promise<DuplicateStructureResult[]>;
    getNearDuplicates(threshold?: number, limit?: number): Promise<NearDuplicateResult[]>;
    getExternalPackages(limit?: number): Promise<ExternalPackageResult[]>;
    render(opts?: {
        maxFiles?: number;
        maxSymbols?: number;
    }): Promise<{
        content: string;
        paths: string[];
    }>;
    getOrphanFiles(limit?: number): Promise<OrphanFileResult[]>;
    getCircularDependencies(limit?: number): Promise<CircularDependencyResult[]>;
    getChangeImpact(paths: string[], maxDepth?: number): Promise<ChangeImpactResult>;
    getSymbolReferences(name: string, limit?: number): Promise<SymbolReferenceResult[]>;
    onFileChanged(absPath: string): Promise<void>;
    close(): Promise<void>;
    isReady(): boolean;
}
export {};
//# sourceMappingURL=client.d.ts.map