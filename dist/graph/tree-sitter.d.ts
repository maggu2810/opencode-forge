import { FileCache } from "./cache";
import { type FileOutline, type Language } from "./types";
export declare class TreeSitterBackend {
    private parser;
    private languages;
    private failedLanguages;
    private initPromise;
    private cache;
    private treeCache;
    private readonly treeCacheMaxSize;
    supportsLanguage(language: Language): boolean;
    setCache(cache: FileCache): void;
    initialize(_cwd: string): Promise<void>;
    dispose(): void;
    getFileOutline(file: string): Promise<FileOutline | null>;
    private static readonly MIN_HASH_LINES;
    private static readonly HASHABLE_KEYWORDS;
    private static isHashableType;
    private serializeShape;
    private countNodes;
    private extractNodeName;
    private collectHashableNodes;
    getShapeHashes(file: string): Promise<Array<{
        name: string;
        kind: string;
        line: number;
        endLine: number;
        shapeHash: string;
        nodeCount: number;
    }> | null>;
    private doInit;
    private resolveWasm;
    private loadLanguage;
    private parseFile;
    private readFileContent;
    private detectLang;
    private grammarKeyForFile;
    private captureToKind;
}
//# sourceMappingURL=tree-sitter.d.ts.map