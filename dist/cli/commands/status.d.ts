interface StatusArgs {
    dbPath?: string;
    resolvedProjectId?: string;
    name?: string;
    server?: string;
    listWorktrees?: boolean;
    listWorktreesFilter?: string;
    limit?: number;
}
export declare function run(argv: StatusArgs): Promise<void>;
export declare function help(): void;
export declare function cli(args: string[], globalOpts: {
    dbPath?: string;
    resolvedProjectId?: string;
    dir?: string;
}): Promise<void>;
export {};
//# sourceMappingURL=status.d.ts.map