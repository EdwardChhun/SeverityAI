import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import './ChatModal.css'; // You'll need to create this CSS file

const ChatModal = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const sendMessage = async () => {
    if (input.trim() === '') return;

    const newMessage = { text: input, user: true };
    setMessages([...messages, newMessage]);
    setInput('');

    try {
      const response = await axios.post(import.meta.env.VITE_FLASK_END_POINT + '/chat', { message: input });
      setMessages(prevMessages => [...prevMessages, { text: response.data.response, user: false }]);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="chat-modal">
      <div className="chat-container">
        <button className="close-button" onClick={onClose}>Close</button>
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
    isOpen: PropTypes.bool.isRequired, // isOpen should be a required boolean
    onClose: PropTypes.func.isRequired, // onClose should be a required function
  };


export default ChatModal;