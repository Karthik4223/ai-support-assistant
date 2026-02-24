import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const chatService = {
    async sendMessage(sessionId, message, mode = 'general') {
        const response = await api.post('/chat', { sessionId, message, mode });
        return response.data;
    },

    async getConversations(sessionId) {
        const response = await api.get(`/conversations/${sessionId}`);
        return response.data;
    },

    async getSessions() {
        const response = await api.get('/sessions');
        return response.data;
    },
};
