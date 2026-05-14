interface PartialMatchResult<T> {
    match: T | null;
    candidates: T[];
}
export declare function findPartialMatch<T>(input: string, items: T[], getFields: (item: T) => (string | undefined)[]): PartialMatchResult<T>;
export declare function filterByPartial<T>(input: string | undefined, items: T[], getFields: (item: T) => (string | undefined)[]): T[];
export {};
//# sourceMappingURL=partial-match.d.ts.map