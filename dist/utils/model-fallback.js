export function parseModelString(modelStr) {
    if (!modelStr)
        return undefined;
    const slashIndex = modelStr.indexOf('/');
    if (slashIndex <= 0 || slashIndex === modelStr.length - 1)
        return undefined;
    return {
        providerID: modelStr.substring(0, slashIndex),
        modelID: modelStr.substring(slashIndex + 1),
    };
}
export async function retryWithModelFallback(callWithModel, callWithoutModel, model, logger, maxRetries = 2) {
    if (!model) {
        return { result: await callWithoutModel(), usedModel: undefined };
    }
    let lastError;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        const result = await callWithModel();
        if (!result.error) {
            return { result, usedModel: model };
        }
        lastError = result.error;
        if (attempt < maxRetries) {
            logger.log(`model attempt ${attempt}/${maxRetries} failed, retrying`);
        }
        else {
            logger.log(`model attempt ${attempt}/${maxRetries} failed`);
        }
    }
    logger.error(`configured model unavailable after ${maxRetries} attempts, falling back to default`, lastError);
    return { result: await callWithoutModel(), usedModel: undefined };
}
//# sourceMappingURL=model-fallback.js.map