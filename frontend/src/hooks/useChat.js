import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { chatService } from '../services/api';

export const useChat = () => {
    const [sessionId, setSessionId] = useState(() => {
        return localStorage.getItem('sessionId') || uuidv4();
    });
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [mode, setMode] = useState(() => {
        return localStorage.getItem('chatMode') || 'general';
    });
    const [error, setError] = useState(null);

    useEffect(() => {
        localStorage.setItem('sessionId', sessionId);
        loadConversations(sessionId);
    }, [sessionId]);

    useEffect(() => {
        localStorage.setItem('chatMode', mode);
    }, [mode]);

    const loadConversations = async (id) => {
        try {
            setLoading(true);
            const data = await chatService.getConversations(id);
            setMessages(data);
            setError(null);
        } catch (err) {
            console.error('Failed to load conversations', err);
            // Don't show error if it's just a new session with no messages
            if (err.response?.status !== 404) {
                setError('Failed to load chat history');
            }
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = async (text) => {
        if (!text.trim()) return;

        const userMessage = {
            role: 'user',
            content: text,
            created_at: new Date().toISOString()
        };

        setMessages(prev => [...prev, userMessage]);
        setLoading(true);
        setError(null);

        try {
            const data = await chatService.sendMessage(sessionId, text, mode);
            const assistantMessage = {
                role: 'assistant',
                content: data.reply,
                created_at: new Date().toISOString()
            };
            setMessages(prev => [...prev, assistantMessage]);
        } catch (err) {
            console.error('Failed to send message', err);
            setError(err.response?.data?.error || 'Failed to send message');
        } finally {
            setLoading(false);
        }
    };

    const startNewChat = useCallback(() => {
        const newId = uuidv4();
        setSessionId(newId);
        setMessages([]);
        localStorage.setItem('sessionId', newId);
    }, []);

    return {
        sessionId,
        messages,
        loading,
        error,
        mode,
        setMode,
        sendMessage,
        startNewChat,
        setSessionId
    };
};
