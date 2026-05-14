import type { ApiDeps } from '../types';
export declare function handleListLoops(_req: Request, _deps: ApiDeps, params: Record<string, string>): Promise<Response>;
export declare function handleGetLoop(_req: Request, _deps: ApiDeps, params: Record<string, string>): Promise<Response>;
export declare function handleStartLoop(req: Request, deps: ApiDeps, params: Record<string, string>): Promise<Response>;
export declare function handleCancelLoop(_req: Request, deps: ApiDeps, params: Record<string, string>): Promise<Response>;
export declare function handleRestartLoop(_req: Request, _deps: ApiDeps, params: Record<string, string>): Promise<Response>;
//# sourceMappingURL=loops.d.ts.map