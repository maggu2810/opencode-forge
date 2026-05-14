interface PromptResponsePart {
    type: string;
    text?: string;
}
interface SessionMessage {
    info: {
        role: string;
    };
    parts: PromptResponsePart[];
}
export declare function buildCustomCompactionPrompt(): string;
export declare function formatCompactionDiagnostics(stats: {
    conventions: number;
    decisions: number;
    tokensInjected: number;
}): string;
export declare function extractCompactionSummary(messages: SessionMessage[]): string | null;
export declare function estimateTokens(text: string): number;
export declare function trimToTokenBudget(content: string, maxTokens: number, priority: 'high' | 'medium' | 'low'): string;
export {};
//# sourceMappingURL=compaction-utils.d.ts.map