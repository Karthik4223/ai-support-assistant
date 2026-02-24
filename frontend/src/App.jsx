import React from 'react';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import { useChat } from './hooks/useChat';
import { AlertCircle } from 'lucide-react';

function App() {
  const {
    sessionId,
    messages,
    loading,
    error,
    mode,
    setMode,
    sendMessage,
    startNewChat,
    setSessionId
  } = useChat();

  return (
    <div className="premium-app-shell fade-in">
      <Sidebar
        activeSessionId={sessionId}
        onSelectSession={setSessionId}
        onNewChat={startNewChat}
        mode={mode}
        setMode={setMode}
      />

      <main style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {error && (
          <div style={{ padding: '0.75rem 1.5rem', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#f87171', borderRadius: '14px', display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem', fontWeight: 600, position: 'absolute', top: '1rem', left: '50%', transform: 'translateX(-50%)', zIndex: 100, backdropFilter: 'blur(10px)' }}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <ChatWindow
          messages={messages}
          loading={loading}
          onSendMessage={sendMessage}
        />
      </main>
    </div>
  );
}

export default App;
