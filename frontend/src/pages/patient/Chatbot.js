import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { askGeneralChatbot, getMedicalRecord } from '../../api/patient';
import { askChatbot } from '../../api/chatbot';
import PageHeader from '../../components/common/PageHeader';
import Loader from '../../components/common/Loader';
import ErrorMessage from '../../components/common/ErrorMessage';
import ChatInterface from '../../components/patient/ChatInterface';
import './Chatbot.css';

const Chatbot = () => {
  const { recordId } = useParams();
  const [record, setRecord] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [sending, setSending] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const initializeChat = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (recordId) {
          try {
            const data = await getMedicalRecord(recordId);
            setRecord(data);
            
            setChatHistory([
              {
                id: 'system-1',
                role: 'system',
                content: `MedChain AI Assistant is ready to answer questions about your medical record "${data.title || 'Untitled'}" uploaded on ${new Date(data.uploadDate).toLocaleDateString()}.`,
                timestamp: new Date(),
              }
            ]);
          } catch (err) {
            console.error('Record loading error:', err);
            setChatHistory([
              {
                id: 'system-error',
                role: 'system',
                content: 'Failed to load medical record details. You can still ask questions about it.',
                isError: true,
                timestamp: new Date(),
              }
            ]);
            // Try to get minimal record info
            const minimalRecord = { id: recordId, title: "Medical Record" };
            setRecord(minimalRecord);
          }
        } else {
          setChatHistory([
            {
              id: 'system-1',
              role: 'system',
              content: 'Welcome to MedChain Chatbot. How can I help you today?',
              timestamp: new Date(),
            }
          ]);
        }
      } catch (err) {
        console.error('Initialization error:', err);
        setError('Failed to initialize chat. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
  
    initializeChat();
  }, [recordId]);
  const handleSendMessage = async (message) => {
    if (!message.trim() || sending) return;
    
    // Add user message to chat
    const userMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: message,
      timestamp: new Date(),
    };
    
    setChatHistory(prev => [...prev, userMessage]);
    setSending(true);
    
    try {
      // Add "typing" indicator
      setChatHistory(prev => [
        ...prev, 
        { id: 'typing', role: 'assistant', isTyping: true }
      ]);
      
      // Send to API - different endpoint based on whether it's record-specific
      const response = recordId 
        ? await askChatbot(recordId, message, user.id)
        : await askGeneralChatbot(message, user.id);
      
      // Remove typing indicator and add response
      setChatHistory(prev => {
        const filteredChat = prev.filter(msg => msg.id !== 'typing');
        return [
          ...filteredChat,
          {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: response.response,
            confidence: response.confidence,
            verified: response.blockchain_verified,
            timestamp: new Date(),
          }
        ];
      });
    } catch (err) {
      // Remove typing indicator and add error message
      setChatHistory(prev => {
        const filteredChat = prev.filter(msg => msg.id !== 'typing');
        return [
          ...filteredChat,
          {
            id: `error-${Date.now()}`,
            role: 'system',
            content: 'Sorry, I encountered an error processing your request. Please try again.',
            isError: true,
            timestamp: new Date(),
          }
        ];
      });
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="chatbot-container">
      <PageHeader 
        title={recordId ? "Medical Record Chatbot" : "MedChain Chatbot"} 
        subtitle={record?.title || 'General Assistance'} 
      />
      
      {recordId && record && (
        <div className="record-info-bar">
          <div className="record-info-item">
            <span className="info-label">Document:</span>
            <span className="info-value">{record.title}</span>
          </div>
          <div className="record-info-item">
            <span className="info-label">Uploaded:</span>
            <span className="info-value">{new Date(record.uploadDate).toLocaleDateString()}</span>
          </div>
          <div className="record-info-item verification">
            <span className={`verification-status ${record.verified ? 'verified' : 'unverified'}`}>
              {record.verified ? 'Blockchain Verified' : 'Verification Pending'}
            </span>
          </div>
        </div>
      )}
      
      <ChatInterface 
        messages={chatHistory}
        onSendMessage={handleSendMessage}
        sending={sending}
      />
    </div>
  );
};

export default Chatbot;