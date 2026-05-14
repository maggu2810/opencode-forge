interface RestartArgs {
    dbPath?: string;
    resolvedProjectId?: string;
    name?: string;
    force?: boolean;
    server?: string;
}
export declare function run(argv: RestartArgs): Promise<void>;
export declare function help(): void;
export declare function cli(args: string[], globalOpts: {
    dbPath?: string;
    resolvedProjectId?: string;
    dir?: string;
}): Promise<void>;
export {};
//# sourceMappingURL=restart.d.ts.map