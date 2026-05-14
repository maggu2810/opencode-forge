export declare function tokenize(source: string): string[];
export declare function computeMinHash(tokens: string[]): Uint32Array | null;
export declare function jaccardSimilarity(a: Uint32Array, b: Uint32Array): number;
export interface FragmentHash {
    hash: string;
    tokenOffset: number;
}
export declare function computeFragmentHashes(tokens: string[]): FragmentHash[];
//# sourceMappingURL=clone-detection.d.ts.map