import React, { useState, useRef, useEffect } from 'react';
import './ChatInterface.css';

const ChatInterface = ({ messages, onSendMessage, sending }) => {
  const [message, setMessage] = useState('');
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Focus input on component mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() && !sending) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const renderMessage = (msg) => {
    if (msg.role === 'system') {
      return (
        <div 
          key={msg.id} 
          className={`message system-message ${msg.isError ? 'error-message' : ''}`}
        >
          {msg.content}
        </div>
      );
    }
    
    if (msg.role === 'user') {
      return (
        <div key={msg.id} className="message user-message">
          <div className="message-content">{msg.content}</div>
          <div className="message-time">
            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      );
    }
    
    if (msg.role === 'assistant') {
      if (msg.isTyping) {
        return (
          <div key="typing" className="message assistant-message typing-message">
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        );
      }
      
      return (
        <div key={msg.id} className="message assistant-message">
          <div className="message-content">{msg.content}</div>
          <div className="message-meta">
            {msg.verified !== undefined && (
              <div className={`verification-dot ${msg.verified ? 'verified' : 'unverified'}`} 
                   title={msg.verified ? 'Blockchain Verified' : 'Verification Pending'}>
              </div>
            )}
            {msg.confidence && (
              <div className="confidence-score" title={`AI Confidence: ${Math.round(msg.confidence * 100)}%`}>
                {Math.round(msg.confidence * 100)}%
              </div>
            )}
            <div className="message-time">
              {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="chat-interface">
      <div className="messages-container" ref={messagesContainerRef}>
        {messages.map(renderMessage)}
      </div>
      
      <form className="message-input-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask a question about your medical record..."
          disabled={sending}
          ref={inputRef}
          className="message-input"
        />
        <button 
          type="submit" 
          className={`send-button ${sending ? 'sending' : ''}`}
          disabled={sending || !message.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatInterface;