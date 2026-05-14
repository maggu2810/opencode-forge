interface CancelArgs {
    dbPath?: string;
    resolvedProjectId?: string;
    name?: string;
    cleanup?: boolean;
    force?: boolean;
}
export declare function run(argv: CancelArgs): Promise<void>;
export declare function help(): void;
export declare function cli(args: string[], globalOpts: {
    dbPath?: string;
    resolvedProjectId?: string;
    dir?: string;
}): Promise<void>;
export {};
//# sourceMappingURL=cancel.d.ts.map