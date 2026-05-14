import type { LoopService } from '../services/loop';
/**
 * Injects the current git branch field into a JSON object for review findings.
 * Checks active memory loops first, then falls back to git command.
 *
 * @param value - The object to inject the branch field into
 * @param directory - The directory to check for git branch
 * @param loopService - The loop service for checking active loops
 */
export declare function injectBranchField(value: unknown, directory: string, loopService: LoopService): void;
//# sourceMappingURL=git-branch.d.ts.map