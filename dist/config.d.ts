import type { AgentRole, AgentDefinition } from './agents';
export declare function createConfigHandler(agents: Record<AgentRole, AgentDefinition>, agentOverrides?: Record<string, {
    temperature?: number;
}>): (config: Record<string, unknown>) => Promise<void>;
//# sourceMappingURL=config.d.ts.map