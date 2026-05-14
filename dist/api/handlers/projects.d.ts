import type { ApiDeps } from '../types';
export declare function listKnownProjects(): Array<{
    id: string;
    name: string | null;
}>;
export declare function handleListProjects(_req: Request, _deps: ApiDeps): Promise<Response>;
export declare function handleGetProject(_req: Request, deps: ApiDeps, params: Record<string, string>): Promise<Response>;
//# sourceMappingURL=projects.d.ts.map