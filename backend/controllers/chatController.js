const dbService = require('../services/dbService');
const llmService = require('../services/llmService');

class ChatController {
    async chat(req, res) {
        const { sessionId, message, mode = 'general' } = req.body;

        if (!sessionId || !message) {
            return res.status(400).json({ error: 'Missing sessionId or message' });
        }

        try {
            // 1. Create session if not exists
            await dbService.createSessionIfNotExists(sessionId);

            // 2. Save user message
            await dbService.saveMessage(sessionId, 'user', message);

            // 3. Generate title if it's the first message
            const session = await dbService.getSession(sessionId);
            if (!session.title || session.title === 'New Conversation') {
                const title = await llmService.generateTitle(message);
                await dbService.updateSessionTitle(sessionId, title);
            }

            // 4. Fetch last 10 messages for current session
            const history = await dbService.getLastMessages(sessionId, 10);

            // 5. Fetch global history for cross-session memory
            const globalHistory = await dbService.getGlobalHistory(20);

            // 6. Get LLM response
            const { reply, tokensUsed } = await llmService.getChatResponse(sessionId, message, history, mode, globalHistory);

            // 7. Save assistant response
            await dbService.saveMessage(sessionId, 'assistant', reply);

            // 8. Update session timestamp
            await dbService.updateSessionTimestamp(sessionId);

            res.json({ reply, tokensUsed });
        } catch (err) {
            console.error('Chat error:', err);
            res.status(500).json({ error: err.message || 'Internal server error' });
        }
    }

    async getConversations(req, res) {
        const { sessionId } = req.params;

        if (!sessionId) {
            return res.status(400).json({ error: 'Missing sessionId' });
        }

        try {
            const messages = await dbService.getAllMessages(sessionId);
            res.json(messages);
        } catch (err) {
            console.error('Get conversations error:', err);
            res.status(500).json({ error: 'Failed to fetch messages' });
        }
    }

    async getSessions(req, res) {
        try {
            const sessions = await dbService.getAllSessions();
            res.json(sessions);
        } catch (err) {
            console.error('Get sessions error:', err);
            res.status(500).json({ error: 'Failed to fetch sessions' });
        }
    }
}

module.exports = new ChatController();
