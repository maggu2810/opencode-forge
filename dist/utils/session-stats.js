function extractActivity(parts) {
    const toolCalls = [];
    const textLines = [];
    const toolLines = [];
    const subtaskLines = [];
    const reasoningLines = [];
    for (const p of parts) {
        if (p.type === 'text' && typeof p.text === 'string' && p.text.trim()) {
            textLines.push(p.text.trim());
        }
        else if (p.type === 'tool' && p.tool && p.state) {
            const s = p.state;
            const name = p.tool;
            const status = s.status;
            if (status === 'completed') {
                const title = s.title ?? name;
                toolCalls.push({ tool: name, title, status: 'completed' });
                toolLines.push(`[done] ${name}: ${title}`);
            }
            else if (status === 'running') {
                const title = s.title ?? name;
                toolCalls.push({ tool: name, title, status: 'running' });
                toolLines.push(`[running] ${name}: ${title}`);
            }
            else if (status === 'error') {
                const msg = s.error ?? 'error';
                toolCalls.push({ tool: name, title: msg, status: 'error' });
                toolLines.push(`[error] ${name}: ${msg}`);
            }
            else if (status === 'pending') {
                toolCalls.push({ tool: name, title: name, status: 'pending' });
                toolLines.push(`[pending] ${name}`);
            }
        }
        else if (p.type === 'subtask' && p.description) {
            const agentLabel = p.agent ? `${p.agent}: ` : '';
            subtaskLines.push(`-> ${agentLabel}${p.description}`);
        }
        else if (p.type === 'reasoning' && typeof p.text === 'string' && p.text.trim()) {
            reasoningLines.push(p.text.trim());
        }
    }
    // Priority: text > tool titles > subtask > reasoning
    let summary = '';
    if (textLines.length > 0) {
        summary = textLines.join('\n');
    }
    else if (toolLines.length > 0) {
        summary = toolLines.join('\n');
    }
    else if (subtaskLines.length > 0) {
        summary = subtaskLines.join('\n');
    }
    else if (reasoningLines.length > 0) {
        summary = reasoningLines.join('\n');
    }
    if (!summary && toolCalls.length === 0)
        return null;
    return { summary, toolCalls };
}
export async function fetchSessionStats(api, sessionId, directory) {
    if (!directory || !sessionId) {
        return null;
    }
    try {
        const messagesResult = await api.client.session.messages({
            sessionID: sessionId,
            directory,
        });
        const messages = (messagesResult.data ?? []);
        const assistantMessages = messages.filter((m) => m.info.role === 'assistant');
        // Walk backwards through the last 3 assistant messages to find meaningful activity
        let lastActivity = null;
        for (let i = assistantMessages.length - 1; i >= Math.max(0, assistantMessages.length - 3); i--) {
            const result = extractActivity(assistantMessages[i].parts);
            if (result) {
                lastActivity = result;
                break;
            }
        }
        let totalInputTokens = 0;
        let totalOutputTokens = 0;
        let totalReasoningTokens = 0;
        let totalCacheRead = 0;
        let totalCacheWrite = 0;
        let totalCost = 0;
        for (const msg of messages) {
            totalCost += msg.info.cost ?? 0;
            const tokens = msg.info.tokens;
            if (tokens) {
                totalInputTokens += tokens.input ?? 0;
                totalOutputTokens += tokens.output ?? 0;
                totalReasoningTokens += tokens.reasoning ?? 0;
                totalCacheRead += tokens.cache?.read ?? 0;
                totalCacheWrite += tokens.cache?.write ?? 0;
            }
        }
        const sessionResult = await api.client.session.get({
            sessionID: sessionId,
            directory,
        });
        const session = sessionResult.data;
        const fileChanges = session?.summary
            ? {
                additions: session.summary.additions,
                deletions: session.summary.deletions,
                files: session.summary.files,
            }
            : null;
        const timing = session?.time?.created && session?.time?.updated
            ? {
                created: session.time.created,
                updated: session.time.updated,
                durationMs: new Date(session.time.updated).getTime() -
                    new Date(session.time.created).getTime(),
            }
            : null;
        return {
            tokens: {
                input: totalInputTokens,
                output: totalOutputTokens,
                reasoning: totalReasoningTokens,
                cacheRead: totalCacheRead,
                cacheWrite: totalCacheWrite,
                total: totalInputTokens +
                    totalOutputTokens +
                    totalReasoningTokens +
                    totalCacheRead +
                    totalCacheWrite,
            },
            cost: totalCost,
            messages: {
                total: messages.length,
                assistant: assistantMessages.length,
            },
            fileChanges,
            timing,
            lastActivity,
        };
    }
    catch {
        return null;
    }
}
//# sourceMappingURL=session-stats.js.map