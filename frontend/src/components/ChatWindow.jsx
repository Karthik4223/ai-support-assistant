import React, { useRef, useEffect, useState } from 'react';
import { Send, User, Bot, Loader2, Sparkles, Image, X } from 'lucide-react';
import { format } from 'date-fns';

const ChatWindow = ({ messages, loading, onSendMessage, mode }) => {
    const [input, setInput] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const clearImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if ((input.trim() || imagePreview) && !loading) {
            onSendMessage(input, imagePreview);
            setInput('');
            clearImage();
        }
    };

    const isPrescriptionMode = mode === 'prescription';

    return (
        <div className="chat-container">
            {/* Header */}
            <div className="chat-header">
                <div className="assistant-info">
                    <div className="avatar-container">
                        <div className="session-icon" style={{ background: isPrescriptionMode ? '#10b981' : 'var(--primary)', color: 'white', width: '42px', height: '42px', borderRadius: '12px' }}>
                            <Bot size={24} />
                        </div>
                        <div className="online-indicator"></div>
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'white' }}>{isPrescriptionMode ? 'MedExtractor' : 'Flash Man'}</h2>
                        <p style={{ fontSize: '0.75rem', color: isPrescriptionMode ? '#10b981' : 'var(--accent)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            {isPrescriptionMode ? 'Medical Data Specialist' : 'Personal Assistant'}
                        </p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <div style={{ padding: '0.5rem 0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-dim)', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Sparkles size={12} className={isPrescriptionMode ? 'text-emerald-400' : 'text-indigo-400'} />
                        {isPrescriptionMode ? 'Gemini' : 'Flash Man v1.0'}
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="messages-list scroll-smooth">
                {messages.length === 0 ? (
                    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', gap: '1.5rem' }} className="fade-in">
                        <div style={{ padding: '2rem', background: isPrescriptionMode ? 'rgba(16, 185, 129, 0.05)' : 'rgba(99, 102, 241, 0.05)', borderRadius: '30px', border: isPrescriptionMode ? '1px solid rgba(16,185,129,0.1)' : '1px solid rgba(99,102,241,0.1)' }}>
                            <Bot size={48} className={isPrescriptionMode ? 'text-emerald-400' : 'text-indigo-400'} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'white', letterSpacing: '-0.02em' }}>
                                {isPrescriptionMode ? 'Medical Extractor' : 'Welcome Back'}
                            </h3>
                            <p style={{ color: 'var(--text-dim)', maxWidth: '280px', marginTop: '0.5rem', lineHeight: '1.6' }}>
                                {isPrescriptionMode ? 'Upload a prescription image to extract structured medical data.' : 'How can I help you with your account or services today?'}
                            </p>
                        </div>
                    </div>
                ) : (
                    messages.map((msg, index) => (
                        <div key={index} className={`message-row ${msg.role === 'user' ? 'user' : 'assistant'} fade-in`}>
                            <div className="message-card">
                                {msg.role === 'assistant' && (
                                    <div style={{ fontSize: '0.65rem', color: isPrescriptionMode ? '#10b981' : 'var(--accent)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px', marginLeft: '4px' }}>
                                        {isPrescriptionMode ? 'MedExtractor' : 'Flash Man'}
                                    </div>
                                )}
                                <div className="bubble">
                                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                                        {msg.content}
                                    </pre>
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
                                <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 600 }}>{isPrescriptionMode ? 'Extracting data...' : 'Thinking...'}</span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="input-area">
                {imagePreview && (
                    <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderTop: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ position: 'relative' }}>
                            <img src={imagePreview} alt="Preview" style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--border-light)' }} />
                            <button onClick={clearImage} style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#ef4444', color: 'white', borderRadius: '50%', padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '2px solid var(--bg-main)' }}>
                                <X size={12} />
                            </button>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>Prescription image ready for processing</p>
                    </div>
                )}
                <form onSubmit={handleSubmit} className="input-box-wrapper" style={{ position: 'relative' }}>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        accept="image/*"
                        style={{ display: 'none' }}
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        style={{ padding: '0.5rem', color: 'var(--text-dim)', background: 'transparent', transition: 'colors 0.2s', cursor: 'pointer' }}
                        className="hover:text-white"
                        title="Upload Prescription Image"
                    >
                        <Image size={24} />
                    </button>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder={isPrescriptionMode ? "Add a note or just send the image..." : "Type your message here..."}
                        className="chat-input"
                        disabled={loading}
                    />
                    <button
                        type="submit"
                        disabled={loading || (!input.trim() && !imagePreview)}
                        className="send-btn"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                    </button>
                </form>
                <div style={{ textAlign: 'center', marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <p style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: 700, opacity: 0.6, letterSpacing: '0.05em', margin: 0 }}>
                        {isPrescriptionMode ? 'AI MEDICAL DATA EXTRACTION POWERED BY GEMINI' : 'FLASH MAN • YOUR PERSONAL ASSISTANT'}
                    </p>
                    <p style={{ fontSize: '0.6rem', color: 'var(--accent)', fontWeight: 800, opacity: 0.8, letterSpacing: '0.1em' }}>
                        BY KARTHIK MALASANI • karthikmalasani21@gmail.com
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ChatWindow;
