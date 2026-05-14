import type { LoggingConfig } from '../types';
export declare function slugify(text: string): string;
export declare function createLogger(config: LoggingConfig): {
    log: (_message: string, ..._args: unknown[]) => void;
    error: (_message: string, ..._args: unknown[]) => void;
    debug: (_message: string, ..._args: unknown[]) => void;
};
//# sourceMappingURL=logger.d.ts.map