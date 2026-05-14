import type { ToolContext } from '../tools/types';
export interface ForgeApiServer {
    url: string;
    stop(): Promise<void>;
}
export declare function startForgeApiServer(ctx: ToolContext): ForgeApiServer | null;
//# sourceMappingURL=server.d.ts.map