export function isSandboxEnabled(config, sandboxManager) {
    return config.sandbox?.mode === 'docker' && !!sandboxManager;
}
//# sourceMappingURL=context.js.map