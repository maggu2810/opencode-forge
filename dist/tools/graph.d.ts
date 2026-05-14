import { tool } from '@opencode-ai/plugin';
import type { ToolContext } from './types';
import type { GraphService } from '../graph';
interface GraphToolContext {
    graphService: GraphService | null;
    graphStatusRepo: ToolContext['graphStatusRepo'];
}
export declare function createGraphTools(ctx: ToolContext & GraphToolContext): Record<string, ReturnType<typeof tool>>;
export {};
//# sourceMappingURL=graph.d.ts.map