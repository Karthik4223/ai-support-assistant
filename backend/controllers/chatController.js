const dbService = require('../services/dbService');
const llmService = require('../services/llmService');

class ChatController {
    async chat(req, res) {
        const { sessionId, message, mode = 'general', image = null, customApiKey = null } = req.body;

        if (!sessionId || (!message && !image)) {
            return res.status(400).json({ error: 'Missing sessionId, message or image' });
        }

        try {
            // 1. Create session if not exists
            await dbService.createSessionIfNotExists(sessionId);

            // 2. Save user message (if there is text or image)
            if (message || image) {
                const messageText = message || '[Image Attachment]';
                await dbService.saveMessage(sessionId, 'user', messageText, image);
            }

            // 3. Generate title if it's the first message
            const session = await dbService.getSession(sessionId);
            if (!session.title || session.title === 'New Conversation') {
                const title = message ? await llmService.generateTitle(message) : 'Prescription Scan';
                await dbService.updateSessionTitle(sessionId, title);
            }

            // 4. Fetch last 10 messages for current session
            const history = await dbService.getLastMessages(sessionId, 10);

            // 5. Fetch global history for cross-session memory
            const globalHistory = await dbService.getGlobalHistory(20);

            // 6. Get LLM response
            const { reply, tokensUsed } = await llmService.getChatResponse(sessionId, message, history, mode, globalHistory, image, customApiKey);

            // 7. Save assistant response
            await dbService.saveMessage(sessionId, 'assistant', reply);

            // 8. Update session timestamp
            await dbService.updateSessionTimestamp(sessionId);

            res.json({ reply, tokensUsed });
            console.log("reply", reply);
            console.log("tokensUsed", tokensUsed);
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

    async getApiKeys(req, res) {
        try {
            const keys = await dbService.getAllApiKeys();
            res.json(keys);
        } catch (err) {
            console.error('Get API keys error:', err);
            res.status(500).json({ error: 'Failed to fetch API keys' });
        }
    }

    async saveApiKey(req, res) {
        const { name, key } = req.body;
        if (!name || !key) {
            return res.status(400).json({ error: 'Missing name or key' });
        }
        try {
            const id = await dbService.saveApiKey(name, key);
            res.json({ id, name });
        } catch (err) {
            console.error('Save API key error:', err);
            res.status(500).json({ error: 'Failed to save API key' });
        }
    }

    async deleteApiKey(req, res) {
        const { id } = req.params;
        try {
            await dbService.deleteApiKey(id);
            res.json({ success: true });
        } catch (err) {
            console.error('Delete API key error:', err);
            res.status(500).json({ error: 'Failed to delete API key' });
        }
    }
}

module.exports = new ChatController();
