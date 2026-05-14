import type { Logger } from '../types';
import type { GraphStats, TopFileResult, FileDepResult, FileCoChangeResult, FileSymbolResult, SymbolSearchResult, SymbolSignatureResult, CallerResult, CalleeResult, UnusedExportResult, DuplicateStructureResult, NearDuplicateResult, ExternalPackageResult, OrphanFileResult, CircularDependencyResult, ChangeImpactResult, SymbolReferenceResult } from './types';
import type { GraphState, GraphStatsPayload } from '../utils/graph-status-store';
interface GraphService {
    /** Whether the graph service is fully initialized and ready to respond to queries. */
    readonly ready: boolean;
    /**
     * Performs a full scan of the codebase, indexing all files and building the graph.
     * Emits progress status updates during indexing.
     */
    scan(): Promise<void>;
    /**
     * Closes the graph service, stopping watchers and releasing resources.
     */
    close(): Promise<void>;
    /**
     * Returns statistics about the indexed codebase.
     */
    getStats(): Promise<GraphStats>;
    /**
     * Returns the top N files by PageRank importance.
     * @param limit - Maximum number of files to return. Defaults to 20.
     */
    getTopFiles(limit?: number): Promise<TopFileResult[]>;
    /**
     * Returns files that depend on the specified file.
     * @param relPath - Relative path to the file.
     */
    getFileDependents(relPath: string): Promise<FileDepResult[]>;
    /**
     * Returns files that the specified file depends on.
     * @param relPath - Relative path to the file.
     */
    getFileDependencies(relPath: string): Promise<FileDepResult[]>;
    /**
     * Returns files that frequently change together with the specified file.
     * @param relPath - Relative path to the file.
     */
    getFileCoChanges(relPath: string): Promise<FileCoChangeResult[]>;
    /**
     * Returns the blast radius (number of affected files) if this file were changed.
     * @param relPath - Relative path to the file.
     */
    getFileBlastRadius(relPath: string): Promise<number>;
    /**
     * Returns all symbols defined in the specified file.
     * @param relPath - Relative path to the file.
     */
    getFileSymbols(relPath: string): Promise<FileSymbolResult[]>;
    /**
     * Searches for symbols by exact name match.
     * @param name - Symbol name to search for.
     * @param limit - Maximum number of results. Defaults to 50.
     */
    findSymbols(name: string, limit?: number): Promise<SymbolSearchResult[]>;
    /**
     * Searches for symbols using full-text search.
     * @param query - Search query string.
     * @param limit - Maximum number of results. Defaults to 20.
     */
    searchSymbolsFts(query: string, limit?: number): Promise<SymbolSearchResult[]>;
    /**
     * Returns the signature of a symbol at the given location.
     * @param path - Absolute path to the file.
     * @param line - Line number of the symbol.
     */
    getSymbolSignature(path: string, line: number): Promise<SymbolSignatureResult | null>;
    /**
     * Returns all call sites that call the symbol at the given location.
     * @param path - Absolute path to the file.
     * @param line - Line number of the symbol definition.
     */
    getCallers(path: string, line: number): Promise<CallerResult[]>;
    /**
     * Returns all symbols called by the symbol at the given location.
     * @param path - Absolute path to the file.
     * @param line - Line number of the symbol definition.
     */
    getCallees(path: string, line: number): Promise<CalleeResult[]>;
    /**
     * Returns exported symbols that appear unused.
     * @param limit - Maximum number of results. Defaults to 50.
     */
    getUnusedExports(limit?: number, includeInternalOnly?: boolean): Promise<UnusedExportResult[]>;
    /**
     * Returns groups of files with duplicate code structures.
     * @param limit - Maximum number of result groups. Defaults to 20.
     */
    getDuplicateStructures(limit?: number): Promise<DuplicateStructureResult[]>;
    /**
     * Returns pairs of similar but not identical code structures.
     * @param threshold - Similarity threshold (0-1). Defaults to 0.8.
     * @param limit - Maximum number of results. Defaults to 50.
     */
    getNearDuplicates(threshold?: number, limit?: number): Promise<NearDuplicateResult[]>;
    /**
     * Returns external packages imported by the codebase.
     * @param limit - Maximum number of results. Defaults to 50.
     */
    getExternalPackages(limit?: number): Promise<ExternalPackageResult[]>;
    /**
     * Returns files with no incoming edges (nobody imports them).
     * @param limit - Maximum number of results. Defaults to 50.
     */
    getOrphanFiles(limit?: number): Promise<OrphanFileResult[]>;
    /**
     * Returns circular dependency cycles in the file dependency graph.
     * @param limit - Maximum number of cycles. Defaults to 20.
     */
    getCircularDependencies(limit?: number): Promise<CircularDependencyResult[]>;
    /**
     * Returns the transitive impact of changing a set of files.
     * @param paths - Relative paths of changed files.
     * @param maxDepth - Maximum BFS traversal depth. Defaults to 5.
     */
    getChangeImpact(paths: string[], maxDepth?: number): Promise<ChangeImpactResult>;
    /**
     * Returns all references to a symbol (imports, calls, re-exports).
     * @param name - Symbol name to search for.
     * @param limit - Maximum number of results. Defaults to 50.
     */
    getSymbolReferences(name: string, limit?: number): Promise<SymbolReferenceResult[]>;
    /**
     * Renders a text visualization of the code graph.
     * @param opts - Rendering options.
     */
    render(opts?: {
        maxFiles?: number;
        maxSymbols?: number;
    }): Promise<{
        content: string;
        paths: string[];
    }>;
    /**
     * Notifies the service that a file has changed, triggering re-indexing.
     * @param absPath - Absolute path to the changed file.
     */
    onFileChanged(absPath: string): void;
    /**
     * Determines whether a full scan is needed on startup based on cache freshness.
     * Returns a decision with reason for logging purposes.
     */
    shouldScanOnStartup(): Promise<{
        shouldScan: boolean;
        reason: string;
    }>;
    /**
     * Ensures the graph index is ready for queries on startup.
     * Scans only when cache is missing, stale, or unhealthy; otherwise skips.
     * @returns 'scanned' if a full scan was performed, 'skipped' if cache was reused
     */
    ensureStartupIndex(): Promise<'scanned' | 'skipped'>;
}
type GraphStatusCallback = (state: GraphState, stats?: GraphStatsPayload, message?: string) => void;
/**
 * Configuration for creating a graph service instance.
 */
interface GraphServiceConfig {
    projectId: string;
    dataDir: string;
    cwd: string;
    logger: Logger;
    watch?: boolean;
    debounceMs?: number;
    onStatusChange?: GraphStatusCallback;
}
/**
 * Creates a graph service instance for code indexing and querying.
 *
 * @param config - Service configuration including project ID, data directory, and callbacks
 * @returns A GraphService instance for code graph operations
 */
export declare function createGraphService(config: GraphServiceConfig): GraphService;
export {};
//# sourceMappingURL=service.d.ts.map