/**
 * Shared plan execution utilities for TUI and tool-side approval.
 *
 * This module provides canonical execution labels and title extraction
 * that both the TUI and plan-approval tool can import.
 */
/**
 * Canonical execution mode labels used by both TUI and architect approval.
 * These labels must match exactly to ensure consistent UX across interfaces.
 */
export declare const PLAN_EXECUTION_LABELS: readonly ["New session", "Execute here", "Loop (worktree)", "Loop"];
export type PlanExecutionLabel = typeof PLAN_EXECUTION_LABELS[number];
/**
 * Extracts a title from plan content for display purposes.
 * Uses the first heading if available, otherwise falls back to first line.
 * Truncates to 60 characters with ellipsis if needed.
 */
export declare function extractPlanTitle(planContent: string): string;
/**
 * Result of loop name extraction with both display and sanitized names.
 */
export interface LoopNameResult {
    /** Display name: exactly what should be shown to users */
    displayName: string;
    /** Execution/worktree name: sanitized slug for worktree creation, KV keys, and uniqueness */
    executionName: string;
}
/**
 * Extracts a short loop name from plan content for worktree/session naming.
 *
 * Accepts the following markdown formats:
 * - `Loop Name: foo`
 * - `**Loop Name**: foo`
 * - `- **Loop Name**: foo` (with list prefix)
 * - Optional leading whitespace
 *
 * Priority order:
 * 1. Explicit "Loop Name:" field if present (machine-friendly, intent-based)
 * 2. First heading/title (fallback for older plans)
 * 3. Default "loop" fallback
 *
 * The result is truncated to 60 characters.
 */
export declare function extractLoopName(planContent: string): string;
/**
 * Extracts both display and execution names from plan content.
 *
 * Returns a LoopNameResult with:
 * - displayName: the exact loop name from the plan (for user-facing display)
 * - executionName: sanitized version safe for worktree names and KV keys
 *
 * This is the preferred way to get loop naming information.
 */
export declare function extractLoopNames(planContent: string): LoopNameResult;
/**
 * Sanitizes a string for use as a worktree/loop name.
 * Converts to lowercase, replaces non-alphanumeric chars with hyphens, removes leading/trailing hyphens.
 */
export declare function sanitizeLoopName(name: string): string;
/**
 * Checks if a given label matches one of the canonical execution labels.
 * Returns the matched canonical label or null if no match.
 */
export declare function matchExecutionLabel(input: string): PlanExecutionLabel | null;
//# sourceMappingURL=plan-execution.d.ts.map