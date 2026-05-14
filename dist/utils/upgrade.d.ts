interface UpgradeResult {
    upgraded: boolean;
    from: string;
    to: string;
    message: string;
}
interface UpgradeCheckResult {
    current: string;
    latest: string | null;
    updateAvailable: boolean;
}
export declare function checkForUpdate(): Promise<UpgradeCheckResult>;
export declare function performUpgrade(runInstall: (cacheDir: string, version: string) => Promise<{
    exitCode: number;
    stderr: string;
}>): Promise<UpgradeResult>;
export {};
//# sourceMappingURL=upgrade.d.ts.map