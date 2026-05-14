import type { PluginConfig, Logger } from '../types';
import type { LoopService } from '../services/loop';
export declare function resolveLoopModel(config: PluginConfig, loopService: LoopService, loopName: string): {
    providerID: string;
    modelID: string;
} | undefined;
export declare function resolveLoopAuditorModel(config: PluginConfig, loopService: LoopService, loopName: string, logger?: Logger): {
    providerID: string;
    modelID: string;
} | undefined;
export declare function formatDuration(seconds: number): string;
export declare function computeElapsedSeconds(startedAt?: string, endedAt?: string): number;
//# sourceMappingURL=loop-helpers.d.ts.map