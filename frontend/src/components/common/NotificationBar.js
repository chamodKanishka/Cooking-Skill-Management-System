import React, { useState, useEffect } from 'react';
import { BellIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const NotificationBar = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchNotifications = async () => {
    if (!currentUser.id) return;

    try {
      const response = await fetch(`http://localhost:8080/api/notifications/unread/count?userId=${currentUser.id}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }
      
      const data = await response.json();
      setUnreadCount(data.count || 0);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  return (
    <button 
      onClick={() => navigate('/notifications')}
      className="relative p-2 rounded-full hover:bg-gray-100 focus:outline-none"
    >
      <BellIcon className="h-6 w-6 text-gray-500" />
      {unreadCount > 0 && (
        <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
          {unreadCount}
        </span>
      )}
    </button>
  );
};

export default NotificationBar;
