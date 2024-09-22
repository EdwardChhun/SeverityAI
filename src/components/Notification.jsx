import React, { useState, useEffect } from 'react';
import './Notification.css'; // You'll need to create this CSS file

const Notification = ({ message }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="notification">
      <p>{message}</p>
    </div>
  );
};

export default Notification;