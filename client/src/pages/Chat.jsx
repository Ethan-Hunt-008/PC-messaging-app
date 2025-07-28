import { useState, useEffect, useRef } from 'react';

function Chat() {
  const [mode, setMode] = useState('local');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [ws, setWs] = useState(null);
  const [userId] = useState(`user-${Math.random().toString(36).substr(2, 9)}`);
  const messagesEndRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // WebSocket connection
  useEffect(() => {
const wsUrl = mode === 'local' ? 'ws://192.168.31.140:5001' : 'wss://messaging-app-t06k.onrender.com';    const websocket = new WebSocket(wsUrl);

    websocket.onopen = () => console.log('Connected to WebSocket');
    websocket.onmessage = (event) => {
      const msg = JSON.parse(event.data);
      setMessages((prev) => [...prev, msg]);
    };
    websocket.onclose = () => console.log('WebSocket disconnected');

    setWs(websocket);

    return () => websocket.close();
  }, [mode]);

  const sendMessage = () => {
    if (message && ws && ws.readyState === WebSocket.OPEN) {
      const msg = { userId, text: message, timestamp: new Date().toISOString() };
      ws.send(JSON.stringify(msg));
      setMessage('');
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      backgroundColor: '#f3f4f6',
      fontFamily: "'Segoe UI', Arial, sans-serif",
      overflow: 'hidden'
    }}>
      <style>
        {`
          @keyframes slide-in {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
          }
          .message-container {
            animation: slide-in 0.3s ease-out;
          }
          .send-button:hover {
            animation: pulse 0.3s ease-in-out;
          }
        `}
      </style>

      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px',
        background: 'linear-gradient(to right, #4b6cb7, #182848)',
        color: '#ffffff',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg style={{ width: '32px', height: '32px', fill: 'none', stroke: '#ffffff', strokeWidth: 2 }} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>ChatSphere</h2>
        </div>
        <select
          value={mode}
          onChange={(e) => setMode(e.target.value)}
          style={{
            padding: '8px 16px',
            backgroundColor: '#ffffff',
            color: '#1f2937',
            borderRadius: '20px',
            border: 'none',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            cursor: 'pointer',
            outline: 'none',
            transition: 'background-color 0.3s, box-shadow 0.3s'
          }}
          onFocus={(e) => e.target.style.boxShadow = '0 0 0 3px rgba(79, 141, 255, 0.3)'}
          onBlur={(e) => e.target.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)'}
          onMouseOver={(e) => e.target.style.backgroundColor = '#f3f4f6'}
          onMouseOut={(e) => e.target.style.backgroundColor = '#ffffff'}
        >
          <option value="local">Local Network</option>
          <option value="internet">Internet</option>
        </select>
      </div>

      {/* Chat Area */}
      <div style={{
        flex: 1,
        padding: '80px 24px 24px',
        overflowY: 'auto',
        background: 'linear-gradient(to bottom, #f9fafb, #e5e7eb)'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {messages.map((msg, index) => (
            <div
              key={index}
              className="message-container"
              style={{
                display: 'flex',
                justifyContent: msg.userId === userId ? 'flex-end' : 'flex-start',
              }}
            >
              <div style={{
                maxWidth: '70%',
                padding: '12px',
                borderRadius: '16px',
                backgroundColor: msg.userId === userId ? '#4b6cb7' : '#ffffff',
                color: msg.userId === userId ? '#ffffff' : '#1f2937',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                transition: 'box-shadow 0.3s',
              }}
              onMouseOver={(e) => e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)'}
              onMouseOut={(e) => e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)'}
              >
                <p style={{ fontSize: '14px', lineHeight: '1.5' }}>{msg.text}</p>
                <span style={{
                  fontSize: '12px',
                  color: msg.userId === userId ? '#bfdbfe' : '#6b7280',
                  display: 'block',
                  marginTop: '4px',
                  textAlign: msg.userId === userId ? 'right' : 'left'
                }}>
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div style={{
        padding: '16px',
        backgroundColor: '#ffffff',
        borderTop: '1px solid #d1d5db',
        boxShadow: '0 -2px 4px rgba(0,0,0,0.1)',
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          maxWidth: '800px',
          margin: '0 auto'
        }}>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            style={{
              flex: 1,
              padding: '12px',
              border: '1px solid #d1d5db',
              borderRadius: '24px',
              backgroundColor: '#f9fafb',
              color: '#1f2937',
              fontSize: '14px',
              outline: 'none',
              transition: 'border-color 0.3s, box-shadow 0.3s'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#4b6cb7';
              e.target.style.boxShadow = '0 0 0 3px rgba(79, 141, 255, 0.3)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#d1d5db';
              e.target.style.boxShadow = 'none';
            }}
          />
          <button
            onClick={sendMessage}
            className="send-button"
            style={{
              padding: '12px',
              backgroundColor: '#4b6cb7',
              color: '#ffffff',
              borderRadius: '50%',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '40px',
              height: '40px',
              transition: 'background-color 0.3s'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#3b5898'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#4b6cb7'}
          >
            <svg style={{ width: '20px', height: '20px', fill: 'none', stroke: '#ffffff', strokeWidth: 2 }} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Chat;