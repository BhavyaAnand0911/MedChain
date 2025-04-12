import { useState } from 'react';
import axios from 'axios';

const useChatbot = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const askQuestion = async (recordId, question, userId) => {
    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('record_id', recordId);
      formData.append('query', question);
      formData.append('user_id', userId);

      const response = await axios.post('/medical_chatbot/ask', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      setMessages(prev => [
        ...prev,
        { type: 'user', content: question },
        { type: 'bot', content: response.data.response }
      ]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to get response');
    } finally {
      setLoading(false);
    }
  };

  return { messages, loading, error, askQuestion };
};

export default useChatbot;