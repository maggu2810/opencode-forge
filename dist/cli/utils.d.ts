import { Database } from 'bun:sqlite';
import type { OpencodeClient } from '@opencode-ai/sdk/v2';
import type { LoopState } from '../services/loop';
export declare function openDatabase(dbPath?: string): Database;
export declare function confirm(message: string): Promise<boolean>;
export declare function resolveProjectNames(): Map<string, string>;
export declare function resolveProjectIdByName(name: string): string | null;
interface GlobalOptions {
    dbPath?: string;
    projectId?: string;
    dir?: string;
    help?: boolean;
}
interface ParsedGlobalOptions {
    globalOpts: GlobalOptions;
    remainingArgs: string[];
}
export declare function parseGlobalOptions(args: string[]): ParsedGlobalOptions;
/**
 * Builds an OpencodeClient from a server URL, extracting embedded Basic Auth
 * credentials (or falling back to `OPENCODE_SERVER_PASSWORD` env var).
 */
export declare function createOpencodeClientFromServer(serverUrl: string, directory: string): OpencodeClient;
/**
 * Resolves a partial loop name against a list of loops. On ambiguity or no
 * match, prints a message to stderr listing all available loops and exits
 * with code 1.
 */
export declare function resolveLoopByNameOrExit<T extends {
    state: LoopState;
}>(name: string, loops: T[]): T;
/**
 * Prints a message surrounded by blank lines. Matches the existing
 * `console.log('')/log(msg)/log('')` boilerplate across CLI commands.
 */
export declare function printBlock(message: string): void;
export {};
//# sourceMappingURL=utils.d.ts.map