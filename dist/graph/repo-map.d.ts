import { Database } from 'bun:sqlite';
import type { TopFileResult, FileDepResult, FileCoChangeResult, FileSymbolResult, SymbolSearchResult, SymbolSignatureResult, CallerResult, CalleeResult, UnusedExportResult, DuplicateStructureResult, NearDuplicateResult, ExternalPackageResult, GraphStats, PrepareScanResult, ScanBatchResult, OrphanFileResult, CircularDependencyResult, ChangeImpactResult, SymbolReferenceResult } from './types';
interface RepoMapConfig {
    cwd: string;
    db: Database;
}
export declare class RepoMap {
    private db;
    private cwd;
    private treeSitter;
    private cache;
    private stmts;
    private scanFiles;
    private scanTotalFiles;
    constructor(config: RepoMapConfig);
    private prepareStatements;
    initialize(): Promise<void>;
    private initSchema;
    scan(): Promise<void>;
    /**
     * Prepare for a full scan by collecting all indexable files and resetting scan state.
     * Returns the total number of files to process and the batch size to use.
     */
    prepareScan(): Promise<PrepareScanResult>;
    /**
     * Scan a batch of files starting at the given offset.
     * Returns progress info including whether scanning is complete.
     */
    scanBatch(offset: number, batchSize: number): Promise<ScanBatchResult>;
    /**
     * Finalize the scan by building all derived state (refs, edges, PageRank, etc).
     * Should be called once after all file batches have been processed.
     */
    finalizeScan(): Promise<void>;
    /**
     * Reset graph data tables before a fresh full scan.
     * This ensures stale file entries and derived data from previous scans are removed.
     */
    private resetGraphDataForFullScan;
    indexFile(filePath: string): Promise<void>;
    private resolveImportSource;
    resolveUnresolvedRefs(): Promise<void>;
    buildEdges(): Promise<void>;
    computePageRank(): Promise<void>;
    computePageRankSync(): Promise<void>;
    render(opts?: {
        maxFiles?: number;
        maxSymbols?: number;
    }): Promise<{
        content: string;
        paths: string[];
    }>;
    getStats(): GraphStats;
    getTopFiles(limit?: number): TopFileResult[];
    getFileDependents(path: string): FileDepResult[];
    getFileDependencies(path: string): FileDepResult[];
    getFileCoChanges(path: string): FileCoChangeResult[];
    getFileBlastRadius(path: string): number;
    getFileSymbols(path: string): FileSymbolResult[];
    findSymbols(query: string, limit?: number): SymbolSearchResult[];
    searchSymbolsFts(query: string, limit?: number): SymbolSearchResult[];
    getSymbolSignature(path: string, line: number): SymbolSignatureResult | null;
    getCallers(path: string, line: number): CallerResult[];
    getCallees(path: string, line: number): CalleeResult[];
    getUnusedExports(limit?: number, includeInternalOnly?: boolean): UnusedExportResult[];
    getDuplicateStructures(limit?: number): DuplicateStructureResult[];
    getNearDuplicates(threshold?: number, limit?: number): NearDuplicateResult[];
    getExternalPackages(limit?: number): ExternalPackageResult[];
    getOrphanFiles(limit?: number): OrphanFileResult[];
    getCircularDependencies(limit?: number): CircularDependencyResult[];
    getChangeImpact(paths: string[], maxDepth?: number): ChangeImpactResult;
    getSymbolReferences(name: string, limit?: number): SymbolReferenceResult[];
    onFileChanged(path: string): Promise<{
        status: string;
    }>;
    private removeFile;
    buildCoChanges(): Promise<void>;
    buildCallGraph(): Promise<void>;
    collectEntrypoints(): Promise<void>;
    linkTestFiles(): void;
    rescueOrphans(): void;
}
export {};
//# sourceMappingURL=repo-map.d.ts.map