import type { ZodType } from 'zod';
import { z as zod } from 'zod';
export declare const PlanWriteBody: zod.ZodObject<{
    content: zod.ZodString;
}, zod.core.$strip>;
export declare const PlanPatchBody: zod.ZodObject<{
    old_string: zod.ZodString;
    new_string: zod.ZodString;
}, zod.core.$strip>;
export declare const PlanExecuteBody: zod.ZodObject<{
    mode: zod.ZodEnum<{
        loop: "loop";
        "new-session": "new-session";
        "execute-here": "execute-here";
        "loop-worktree": "loop-worktree";
    }>;
    title: zod.ZodString;
    executionModel: zod.ZodOptional<zod.ZodString>;
    auditorModel: zod.ZodOptional<zod.ZodString>;
    targetSessionId: zod.ZodOptional<zod.ZodString>;
    plan: zod.ZodOptional<zod.ZodString>;
}, zod.core.$strip>;
export declare const LoopStartBody: zod.ZodObject<{
    plan: zod.ZodString;
    title: zod.ZodString;
    worktree: zod.ZodOptional<zod.ZodBoolean>;
    executionModel: zod.ZodOptional<zod.ZodString>;
    auditorModel: zod.ZodOptional<zod.ZodString>;
    hostSessionId: zod.ZodOptional<zod.ZodString>;
}, zod.core.$strip>;
export declare const ModelPrefsBody: zod.ZodObject<{
    mode: zod.ZodOptional<zod.ZodEnum<{
        loop: "loop";
        "new-session": "new-session";
        "execute-here": "execute-here";
        "loop-worktree": "loop-worktree";
    }>>;
    executionModel: zod.ZodOptional<zod.ZodString>;
    auditorModel: zod.ZodOptional<zod.ZodString>;
}, zod.core.$strip>;
export declare const FindingWriteBody: zod.ZodObject<{
    file: zod.ZodString;
    line: zod.ZodNumber;
    severity: zod.ZodEnum<{
        bug: "bug";
        warning: "warning";
    }>;
    description: zod.ZodString;
    scenario: zod.ZodOptional<zod.ZodString>;
    branch: zod.ZodOptional<zod.ZodNullable<zod.ZodString>>;
}, zod.core.$strip>;
export declare const LoopRestartBody: zod.ZodObject<{
    force: zod.ZodOptional<zod.ZodBoolean>;
}, zod.core.$strip>;
type InferType<T extends ZodType> = zod.infer<T>;
export type PlanWrite = InferType<typeof PlanWriteBody>;
export type PlanPatch = InferType<typeof PlanPatchBody>;
export type PlanExecute = InferType<typeof PlanExecuteBody>;
export type LoopStart = InferType<typeof LoopStartBody>;
export type ModelPrefs = InferType<typeof ModelPrefsBody>;
export type FindingWrite = InferType<typeof FindingWriteBody>;
export type LoopRestart = InferType<typeof LoopRestartBody>;
export declare function parseJsonBody<T>(req: Request, schema: ZodType<T>): Promise<T>;
export {};
//# sourceMappingURL=schemas.d.ts.map