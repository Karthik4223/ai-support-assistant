import React, { useRef, useEffect, useState } from 'react';
import { Send, User, Bot, Loader2, Sparkles } from 'lucide-react';
import { format } from 'date-fns';

const ChatWindow = ({ messages, loading, onSendMessage }) => {
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (input.trim() && !loading) {
            onSendMessage(input);
            setInput('');
        }
    };

    return (
        <div className="chat-container">
            {/* Header */}
            <div className="chat-header">
                <div className="assistant-info">
                    <div className="avatar-container">
                        <div className="session-icon" style={{ background: 'var(--primary)', color: 'white', width: '42px', height: '42px', borderRadius: '12px' }}>
                            <Bot size={24} />
                        </div>
                        <div className="online-indicator"></div>
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'white' }}>Flash Man</h2>
                        <p style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Personal Assistant</p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <div style={{ padding: '0.5rem 0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-dim)', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Sparkles size={12} className="text-indigo-400" />
                        Flash Man v1.0
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="messages-list scroll-smooth">
                {messages.length === 0 ? (
                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '1.5rem' }} className="fade-in">
                        <div style={{ padding: '2rem', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '30px', border: '1px solid rgba(99,102,241,0.1)' }}>
                            <Bot size={48} className="text-indigo-400" />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>Welcome Back</h3>
                            <p style={{ color: 'var(--text-dim)', maxWidth: '280px', marginTop: '0.5rem', lineHeight: '1.6' }}>How can I help you with your account or services today?</p>
                        </div>
                    </div>
                ) : (
                    messages.map((msg, index) => (
                        <div key={index} className={`message-row ${msg.role === 'user' ? 'user' : 'assistant'} fade-in`}>
                            <div className="message-card">
                                {msg.role === 'assistant' && (
                                    <div style={{ fontSize: '0.65rem', color: 'var(--accent)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', marginLeft: '4px' }}>
                                        Flash Man
                                    </div>
                                )}
                                <div className="bubble">
                                    {msg.content}
                                </div>
                                <div className="timestamp">
                                    {format(new Date(msg.created_at || Date.now()), 'hh:mm a')}
                                </div>
                            </div>
                        </div>
                    ))
                )}

                {loading && (
                    <div className="message-row assistant fade-in">
                        <div className="message-card">
                            <div className="bubble" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.25rem' }}>
                                <div className="typing-dots">
                                    <div className="dot"></div>
                                    <div className="dot"></div>
                                    <div className="dot"></div>
                                </div>
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 600 }}>Thinking...</span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="input-area">
                <form onSubmit={handleSubmit} className="input-box-wrapper">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type your message here..."
                        className="chat-input"
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="send-btn"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                    </button>
                </form>
                <p style={{ textAlign: 'center', fontSize: '0.65rem', color: 'var(--text-dim)', marginTop: '1rem', fontWeight: 700, opacity: 0.6, letterSpacing: '0.05em' }}>
                    FLASH MAN • YOUR PERSONAL ASSISTANT
                </p>
            </div>
        </div>
    );
};

export default ChatWindow;
