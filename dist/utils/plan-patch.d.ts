/**
 * Shared plan patching logic used by both the plan-edit tool and API handlers.
 */
export interface PlanPatchResult {
    success: boolean;
    updated?: string;
    error?: string;
}
export declare function applyPlanPatch(existing: string, oldString: string, newString: string): PlanPatchResult;
//# sourceMappingURL=plan-patch.d.ts.map