/**
 * Shared plan patching logic used by both the plan-edit tool and API handlers.
 */
export function applyPlanPatch(existing, oldString, newString) {
    const occurrences = existing.split(oldString).length - 1;
    if (occurrences === 0) {
        return { success: false, error: 'old_string not found in plan' };
    }
    if (occurrences > 1) {
        return {
            success: false,
            error: `old_string found ${occurrences} times - must be unique`,
        };
    }
    const updated = existing.replace(oldString, newString);
    return { success: true, updated };
}
//# sourceMappingURL=plan-patch.js.map