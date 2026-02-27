import React, { useState, useEffect } from 'react';
import { Plus, MessageSquare, History, Clock, Settings, User } from 'lucide-react';
import { chatService } from '../services/api';
import { format } from 'date-fns';

const Sidebar = ({ onSelectSession, activeSessionId, onNewChat, mode, setMode }) => {
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    const fetchSessions = async () => {
        try {
            setLoading(true);
            const data = await chatService.getSessions();
            setSessions(data);
        } catch (err) {
            console.error('Failed to fetch sessions', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSessions();
    }, [activeSessionId]);

    return (
        <div className="sidebar">
            <div className="sidebar-header">
                <button
                    onClick={onNewChat}
                    className="new-chat-btn"
                >
                    <Plus size={20} style={{ strokeWidth: 3 }} />
                    New Conversation
                </button>
            </div>

            <div className="history-section custom-scrollbar">
                <div className="section-label">
                    <History size={14} />
                    Recent Chats
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {sessions.map((session) => (
                        <button
                            key={session.sessionId}
                            onClick={() => onSelectSession(session.sessionId)}
                            className={`session-item ${activeSessionId === session.sessionId ? 'active' : ''}`}
                        >
                            <div className="session-icon">
                                <MessageSquare size={16} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: activeSessionId === session.sessionId ? 'white' : 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {session.title || `Session ${session.sessionId.substring(0, 6).toUpperCase()}`}
                                </span>
                                <span style={{ fontSize: '0.65rem', opacity: 0.5, display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                                    <Clock size={10} />
                                    {format(new Date(session.updated_at), 'MMM dd, HH:mm')}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            <div style={{ padding: '1.25rem', borderTop: '1px solid var(--border-light)', background: 'rgba(0,0,0,0.2)', position: 'relative' }}>
                {showSettings && (
                    <div className="fade-in" style={{ position: 'absolute', bottom: '100%', left: '1rem', right: '1rem', background: '#1e293b', border: '1px solid var(--border-light)', borderRadius: '16px', padding: '1rem', marginBottom: '1rem', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', zIndex: 100 }}>
                        <p style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.05em' }}>Agent Mode</p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <button
                                onClick={() => { setMode('general'); setShowSettings(false); }}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', background: mode === 'general' ? 'var(--primary)' : 'rgba(255,255,255,0.05)', color: 'white', fontSize: '0.8rem', fontWeight: 700, textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                            >
                                General Assistant
                                {mode === 'general' && <div style={{ width: '8px', height: '8px', background: 'white', borderRadius: '50%' }} />}
                            </button>
                            <button
                                onClick={() => { setMode('docs'); setShowSettings(false); }}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', background: mode === 'docs' ? 'var(--primary)' : 'rgba(255,255,255,0.05)', color: 'white', fontSize: '0.8rem', fontWeight: 700, textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                            >
                                Docs Specialist
                                {mode === 'docs' && <div style={{ width: '8px', height: '8px', background: 'white', borderRadius: '50%' }} />}
                            </button>
                            <button
                                onClick={() => { setMode('prescription'); setShowSettings(false); }}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '10px', background: mode === 'prescription' ? 'var(--primary)' : 'rgba(255,255,255,0.05)', color: 'white', fontSize: '0.8rem', fontWeight: 700, textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                            >
                                Prescription Extractor
                                {mode === 'prescription' && <div style={{ width: '8px', height: '8px', background: 'white', borderRadius: '50%' }} />}
                            </button>
                        </div>
                    </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ width: '40px', height: '40px', background: 'var(--bg-surface)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-light)' }}>
                            <User size={20} className="text-slate-400" />
                        </div>
                        <div>
                            <p style={{ fontSize: '0.85rem', fontWeight: 800, color: 'white' }}>Super Admin</p>
                            <p style={{ fontSize: '0.65rem', color: mode === 'docs' ? '#60a5fa' : (mode === 'prescription' ? '#10b981' : 'var(--accent)'), fontWeight: 800 }}>
                                {mode === 'docs' ? 'DOCS MODE' : (mode === 'prescription' ? 'PRESCRIPTION MODE' : 'GENERAL MODE')}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        style={{ color: showSettings ? 'white' : 'var(--text-dim)', padding: '0.5rem', borderRadius: '10px', background: showSettings ? 'rgba(255,255,255,0.1)' : 'transparent' }}
                        className="hover:bg-white/5"
                    >
                        <Settings size={18} className={showSettings ? 'rotate-90' : ''} style={{ transition: 'all 0.3s' }} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
