import type { RouteMatch, RouteHandler } from './types';
export interface Route {
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    pattern: string;
    handler: RouteHandler;
}
export declare function match(routes: Route[], method: string, pathname: string): RouteMatch | null;
//# sourceMappingURL=router.d.ts.map