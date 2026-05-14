export interface AuthConfig {
    password?: string;
    localhostOnly: boolean;
}
export declare function parseBasicAuth(header: string | null): {
    password: string;
} | null;
export declare function authenticate(req: Request, cfg: AuthConfig): void | never;
//# sourceMappingURL=auth.d.ts.map