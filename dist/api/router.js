function patternToRegex(pattern) {
    const paramNames = [];
    const regexStr = pattern.replace(/:(\w+)/g, (_, paramName) => {
        paramNames.push(paramName);
        return '([^/]+)';
    });
    const regex = new RegExp(`^${regexStr}$`);
    return { regex, paramNames };
}
export function match(routes, method, pathname) {
    for (const route of routes) {
        if (route.method !== method) {
            continue;
        }
        const { regex, paramNames } = patternToRegex(route.pattern);
        const match = pathname.match(regex);
        if (match) {
            const params = {};
            for (let i = 0; i < paramNames.length; i++) {
                params[paramNames[i]] = match[i + 1];
            }
            return {
                handler: route.handler,
                params,
            };
        }
    }
    return null;
}
//# sourceMappingURL=router.js.map