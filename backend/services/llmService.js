const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');

class LLMService {
    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
            baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
        });
        this.docsPath = path.resolve(__dirname, '../docs.json');
    }

    loadDocs() {
        try {
            const data = fs.readFileSync(this.docsPath, 'utf8');
            return JSON.parse(data);
        } catch (err) {
            console.error('Error loading docs.json', err);
            return [];
        }
    }

    async getChatResponse(sessionId, userMessage, history, mode = 'general', globalHistory = []) {
        const docs = this.loadDocs();
        const docsContent = docs.map(doc => `Title: ${doc.title}\nContent: ${doc.content}`).join('\n\n');

        let systemPrompt = '';

        if (mode === 'docs') {
            systemPrompt = `You are Flash Man, a helpful assistant. You MUST answer ONLY using the provided documentation. 
If the information is not in the documentation, say "I'm sorry, my current mode only allows me to answer based on official documentation, and I couldn't find that there."

Documentation:
${docsContent}`;
        } else {
            systemPrompt = `You are Flash Man, a super-fast personal assistant. You have access to documentation but can also use your general knowledge.

Documentation:
${docsContent}

Global Memory (Recent interactions across all sessions):
${globalHistory.map(h => `[Session: ${h.sessionTitle}] ${h.role}: ${h.content}`).join('\n')}

Instructions:
1. Prioritize documentation if relevant.
2. Use your general knowledge for other queries.
3. You have a "Global Memory" of previous chats. If the user asks about past conversations, refer to the Global Memory provided above.`;
        }

        const messages = [
            { role: 'system', content: systemPrompt },
            ...history.map(msg => ({ role: msg.role, content: msg.content })),
            { role: 'user', content: userMessage }
        ];

        try {
            const response = await this.openai.chat.completions.create({
                model: process.env.LLM_MODEL || "gpt-3.5-turbo",
                messages: messages,
                temperature: 0,
            });

            return {
                reply: response.choices[0].message.content,
                tokensUsed: response.usage.total_tokens
            };
        } catch (err) {
            console.error('LLM API Error:', err);
            throw new Error('Failed to fetch AI response');
        }
    }

    async generateTitle(userMessage) {
        try {
            const response = await this.openai.chat.completions.create({
                model: process.env.LLM_MODEL || "gpt-3.5-turbo",
                messages: [
                    {
                        role: 'system',
                        content: 'Generate a very short, catchy title (max 4 words) for a chat conversation that begins with the following user message. Return ONLY the title text.'
                    },
                    { role: 'user', content: userMessage }
                ],
                temperature: 0.7,
                max_tokens: 15
            });

            return response.choices[0].message.content.replace(/["']/g, '').trim();
        } catch (err) {
            console.error('Title Generation Error:', err);
            return 'New Conversation';
        }
    }
}

module.exports = new LLMService();
