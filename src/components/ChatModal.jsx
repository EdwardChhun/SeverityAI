import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import './ChatModal.css';
import Notification from './Notification';

const ChatModal = ({ isOpen, onClose, patientSummary }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    if (isOpen && patientSummary) {
      initializeChat();
    }
  }, [isOpen, patientSummary]);

  const initializeChat = async () => {
    try {
      const response = await axios.post(import.meta.env.VITE_FLASK_END_POINT + '/chat/initialize', { summary: patientSummary });
      setMessages([{ text: response.data.response, user: false }]);
    } catch (error) {
      console.error('Error initializing chat:', error);
    }
  };

  const sendMessage = async () => {
    if (input.trim() === '') return;

    const newMessage = { text: input, user: true };
    setMessages([...messages, newMessage]);
    setInput('');

    try {
      const response = await axios.post(import.meta.env.VITE_FLASK_END_POINT + '/chat', { 
        message: input,
        summary: patientSummary // Include the summary in each message for context
      });
      setMessages(prevMessages => [...prevMessages, { text: response.data.response, user: false }]);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="chat-modal">
      <div className="chat-container">
        <Notification message ={"You're up next!, Booth #16"}/>
        <button className="close-button" onClick={onClose}>X</button>
        <div className="chat-messages">
          {messages.map((message, index) => (
            <div key={index} className={`message ${message.user ? 'user' : 'bot'}`}>
              {message.text}
            </div>
          ))}
        </div>
        <div className="chat-input">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type your message..."
          />
          <button onClick={sendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
};

ChatModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  patientSummary: PropTypes.string.isRequired,
};

export default ChatModal;