import React, { useRef, useEffect, useState } from 'react';
import { Send, User, Bot, Loader2, Sparkles, Image, X, ZoomIn, ZoomOut, RefreshCcw, Key, Plus, Menu } from 'lucide-react';
import { format } from 'date-fns';

const ChatWindow = ({ messages, loading, onSendMessage, mode, apiKeys = [], selectedApiKey, setSelectedApiKey, addApiKey, sidebarOpen, setSidebarOpen }) => {
    const [input, setInput] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);
    const [showFullPrompt, setShowFullPrompt] = useState(false);
    const [useCustomPrompt, setUseCustomPrompt] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [zoomedImage, setZoomedImage] = useState(null);
    const [zoomScale, setZoomScale] = useState(1);
    const [showApiKeyModal, setShowApiKeyModal] = useState(false);
    const [newKeyName, setNewKeyName] = useState('');
    const [newKeyValue, setNewKeyValue] = useState('');

    const PROMPT_ONE = `### SYSTEM ROLE

You are an expert Medical Data Extraction Specialist. Your task is to extract information from medical prescriptions with high accuracy. 

### CONTEXT
You will be provided with an image or PDF of a medical prescription.

### TASK
Extract the following information:
1. Patient Details (Name, Age, Gender)
2. Prescribing Doctor Details (Name, Qualifications, Registration Number, Clinic Name)
3. Date of Prescription
4. List of Medications (Drug Name, Strength/Dosage, Frequency, Duration)
5. Diagnosis or Key Findings

### OUTPUT FORMAT
Provide the output in a clear, structured Markdown format.`;

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) processFile(file);
    };

    const processFile = (file) => {
        setSelectedImage(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && (file.type.startsWith('image/') || file.type === 'application/pdf')) {
            processFile(file);
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
            onSendMessage(input, imagePreview, selectedApiKey?.key);
            setInput('');
            clearImage();
        }
    };

    const isPrescriptionMode = mode === 'prescription';

    return (
        <div
            className={`chat-container ${isDragging ? 'dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {isDragging && (
                <div className="drop-overlay fade-in">
                    <div className="drop-content">
                        <div className="drop-icon-container">
                            <Image size={48} className="text-emerald-400" />
                        </div>
                        <h3>Drop to Upload</h3>
                        <p>Upload Prescription Image or PDF</p>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="chat-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <button
                        // onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="sidebar-toggle-btn"
                    >
                        {/* <Menu size={20} /> */}
                    </button>
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
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <div className="api-key-selector-container">
                        <Key size={14} className="text-dim mr-2" />
                        <select
                            className="api-key-select"
                            value={selectedApiKey?.id || ''}
                            onChange={(e) => {
                                const key = apiKeys.find(k => k.id === parseInt(e.target.value));
                                setSelectedApiKey(key || null);
                            }}
                        >
                            <option value="">Default API Key</option>
                            {apiKeys.map(k => (
                                <option key={k.id} value={k.id}>{k.name}</option>
                            ))}
                        </select>
                        <button className="add-key-btn" onClick={() => setShowApiKeyModal(true)}>
                            <Plus size={14} />
                        </button>
                    </div>
                    <div style={{ padding: '0.5rem 0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-dim)', border: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Sparkles size={12} className={isPrescriptionMode ? 'text-emerald-400' : 'text-indigo-400'} />
                        {isPrescriptionMode ? 'Gemini' : 'Flash Man v1.0'}
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="messages-list scroll-smooth">
                {isPrescriptionMode && (
                    <div style={{ margin: '1rem', padding: '1rem', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.1)', borderRadius: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: showFullPrompt ? '0.75rem' : '0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Sparkles size={16} className="text-emerald-400" />
                                <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'white' }}>PRESCRIPTION PROMPT</span>
                            </div>
                            <button
                                onClick={() => setShowFullPrompt(!showFullPrompt)}
                                style={{ fontSize: '0.7rem', fontWeight: 700, color: '#10b981', background: 'transparent', cursor: 'pointer', border: 'none' }}
                            >
                                {showFullPrompt ? 'HIDE DETAILS' : 'SHOW DETAILS'}
                            </button>
                        </div>
                        {showFullPrompt && (
                            <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.7)', lineHeight: '1.5', whiteSpace: 'pre-wrap', maxHeight: '300px', overflowY: 'auto', padding: '0.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                                {PROMPT_ONE}
                            </div>
                        )}
                        <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', borderTop: '1px solid rgba(16,185,129,0.1)', paddingTop: '0.75rem' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    checked={useCustomPrompt}
                                    onChange={(e) => setUseCustomPrompt(e.target.checked)}
                                    style={{ width: '16px', height: '16px', accentColor: '#10b981' }}
                                />
                                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: useCustomPrompt ? '#10b981' : 'var(--text-dim)' }}>
                                    USE CUSTOM PROMPT
                                </span>
                            </label>
                            {useCustomPrompt && (
                                <span style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: 800, padding: '2px 8px', background: 'rgba(16,185,129,0.1)', borderRadius: '10px' }}>
                                    ACTIVE
                                </span>
                            )}
                        </div>
                    </div>
                )}

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
                                    {msg.image && (
                                        <div className="message-image-container">
                                            {msg.image.startsWith('data:application/pdf') ? (
                                                <div className="pdf-preview-bubble">
                                                    <div className="pdf-icon-wrapper">PDF</div>
                                                    <span>Prescription PDF</span>
                                                </div>
                                            ) : (
                                                <img
                                                    src={msg.image}
                                                    alt="Attached"
                                                    className="message-image"
                                                    onClick={() => setZoomedImage(msg.image)}
                                                />
                                            )}
                                        </div>
                                    )}
                                    {msg.content !== '[Image Attachment]' && (
                                        <div className="message-text">
                                            <pre style={{ margin: 0, whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>
                                                {msg.content}
                                            </pre>
                                        </div>
                                    )}
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

            {/* Input Area */}
            <div className="input-area">
                {imagePreview && (
                    <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderTop: '1px solid var(--border-light)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ position: 'relative' }}>
                            {selectedImage?.type === 'application/pdf' ? (
                                <div style={{ width: '60px', height: '60px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', fontWeight: 800, fontSize: '0.7rem' }}>
                                    PDF
                                </div>
                            ) : (
                                <img src={imagePreview} alt="Preview" style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--border-light)' }} />
                            )}
                            <button onClick={clearImage} style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#ef4444', color: 'white', borderRadius: '50%', padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: '2px solid var(--bg-main)' }}>
                                <X size={12} />
                            </button>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontWeight: 600 }}>
                            {selectedImage?.type === 'application/pdf' ? 'Prescription PDF' : 'Prescription image'} ready for processing
                        </p>
                    </div>
                )}
                <form onSubmit={handleSubmit} className="input-box-wrapper" style={{ position: 'relative' }}>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleImageChange}
                        accept="image/*,application/pdf"
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
                    {(!isPrescriptionMode || useCustomPrompt) && (
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={useCustomPrompt ? "Enter your custom extraction prompt..." : "Type your message here..."}
                            className="chat-input"
                            disabled={loading}
                            style={{ border: useCustomPrompt ? '1px solid #10b981' : 'none' }}
                        />
                    )}
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
                        {isPrescriptionMode ? 'AI MEDICAL DATA EXTRACTION POWERED BY GEMINI' : 'FLASH MAN \u2022 YOUR PERSONAL ASSISTANT'}
                    </p>
                    <p style={{ fontSize: '0.6rem', color: 'var(--accent)', fontWeight: 800, opacity: 0.8, letterSpacing: '0.1em' }}>
                        BY KARTHIK MALASANI \u2022 karthikmalasani21@gmail.com
                    </p>
                </div>
            </div>

            {/* Image Zoom Modal */}
            {zoomedImage && (
                <div className="image-modal-overlay fade-in" onClick={() => { setZoomedImage(null); setZoomScale(1); }}>
                    <div className="image-modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-toolbar">
                            <button className="toolbar-btn" onClick={() => setZoomScale(prev => Math.min(prev + 0.25, 3))} title="Zoom In">
                                <ZoomIn size={20} />
                            </button>
                            <button className="toolbar-btn" onClick={() => setZoomScale(prev => Math.max(prev - 0.25, 0.5))} title="Zoom Out">
                                <ZoomOut size={20} />
                            </button>
                            <button className="toolbar-btn" onClick={() => setZoomScale(1)} title="Reset">
                                <RefreshCcw size={20} />
                            </button>
                            <div className="toolbar-divider"></div>
                            <button className="toolbar-btn close" onClick={() => { setZoomedImage(null); setZoomScale(1); }}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="zoomed-image-wrapper">
                            <img
                                src={zoomedImage}
                                alt="Zoomed"
                                className="zoomed-image"
                                style={{ transform: `scale(${zoomScale})` }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Add API Key Modal */}
            {showApiKeyModal && (
                <div className="image-modal-overlay fade-in" onClick={() => setShowApiKeyModal(false)}>
                    <div className="image-modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px', height: 'auto', background: 'var(--bg-surface)', padding: '2rem', borderRadius: '24px', border: '1px solid var(--border-light)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h3 style={{ margin: 0, color: 'white' }}>Add Custom API Key</h3>
                            <button className="toolbar-btn close" style={{ border: 'none' }} onClick={() => setShowApiKeyModal(false)}><X size={20} /></button>
                        </div>
                        <div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: 600 }}>Key Name (e.g., My Gemini Key)</label>
                                <input
                                    type="text"
                                    className="chat-input"
                                    value={newKeyName}
                                    onChange={(e) => setNewKeyName(e.target.value)}
                                    placeholder="Enter a recognizable name"
                                    style={{ width: '100%', padding: '0.8rem 1rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-light)', borderRadius: '12px', color: 'white' }}
                                />
                            </div>
                            <div style={{ marginBottom: '2rem' }}>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-dim)', fontWeight: 600 }}>API Key</label>
                                <input
                                    type="password"
                                    className="chat-input"
                                    value={newKeyValue}
                                    onChange={(e) => setNewKeyValue(e.target.value)}
                                    placeholder="Enter your Google API key"
                                    style={{ width: '100%', padding: '0.8rem 1rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-light)', borderRadius: '12px', color: 'white' }}
                                />
                            </div>
                            <button className="new-chat-btn" style={{ width: '100%', border: 'none' }} onClick={async () => {
                                if (newKeyName && newKeyValue) {
                                    await addApiKey(newKeyName, newKeyValue);
                                    setShowApiKeyModal(false);
                                    setNewKeyName('');
                                    setNewKeyValue('');
                                }
                            }}>
                                Save API Key
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ChatWindow;
