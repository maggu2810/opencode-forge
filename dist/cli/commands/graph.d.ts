interface GraphArgs {
    dbPath?: string;
    resolvedProjectId?: string;
    dir?: string;
    action: 'status' | 'scan' | 'list' | 'remove' | 'cleanup';
    target?: string;
    yes?: boolean;
    days?: number;
}
export declare function run(argv: GraphArgs): Promise<void>;
export declare function help(): void;
export declare function cli(args: string[], globalOpts: {
    dbPath?: string;
    resolvedProjectId?: string;
    dir?: string;
}): Promise<void>;
export {};
//# sourceMappingURL=graph.d.ts.map