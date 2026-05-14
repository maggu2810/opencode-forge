import { buildCustomCompactionPrompt, } from './compaction-utils';
const LOGGED_EVENTS = new Set(['session.compacted', 'session.status', 'session.updated', 'session.created']);
function formatEventProperties(props) {
    if (!props)
        return '';
    try {
        return ' ' + JSON.stringify(props);
    }
    catch {
        return '';
    }
}
const DEFAULT_COMPACTION_CONFIG = {
    customPrompt: true,
    maxContextTokens: 4000,
};
export function createSessionHooks(projectId, logger, _ctx, config) {
    const initializedSessions = new Set();
    const compactionConfig = { ...DEFAULT_COMPACTION_CONFIG, ...config };
    return {
        async onMessage(input, _output) {
            const chatInput = input;
            const sessionId = chatInput.sessionID;
            if (!sessionId)
                return;
            if (!initializedSessions.has(sessionId)) {
                logger.log(`Session initialized: ${sessionId} (project ${projectId})`);
                initializedSessions.add(sessionId);
            }
        },
        async onEvent(input) {
            const { event } = input;
            if (event && LOGGED_EVENTS.has(event.type)) {
                logger.log(`Event received: ${event.type}${formatEventProperties(event.properties)}`);
            }
            if (event?.type !== 'session.compacted')
                return;
            const sessionId = event.properties?.sessionId ??
                event.properties?.sessionID;
            if (!sessionId) {
                logger.log(`session.compacted event missing sessionId`);
                return;
            }
            logger.log(`Session compacted for project ${projectId}`);
        },
        async onCompacting(input, output) {
            const { sessionID: sessionId } = input;
            logger.log(`Compacting hook fired for project ${projectId}, session ${sessionId}`);
            if (compactionConfig.customPrompt) {
                output.prompt = buildCustomCompactionPrompt();
                logger.log(`Compacting: set custom compaction prompt`);
            }
        },
    };
}
//# sourceMappingURL=session.js.map