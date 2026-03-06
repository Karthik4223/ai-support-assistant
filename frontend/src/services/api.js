import axios from 'axios';

const API_BASE_URL = import.meta.env.PROD
    ? '/api'
    : 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const chatService = {
    async sendMessage(sessionId, message, mode = 'general', image = null, customApiKey = null) {
        const response = await api.post('/chat', { sessionId, message, mode, image, customApiKey });
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

    async getApiKeys() {
        const response = await api.get('/api-keys');
        return response.data;
    },

    async saveApiKey(name, key) {
        const response = await api.post('/api-keys', { name, key });
        return response.data;
    },

    async deleteApiKey(id) {
        const response = await api.delete(`/api-keys/${id}`);
        return response.data;
    }
};
