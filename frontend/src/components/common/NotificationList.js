import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

const NotificationList = () => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  
  const fetchNotifications = async () => {
    if (!currentUser.id) {
      setError('Please log in to view notifications');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`http://localhost:8080/api/notifications?userId=${currentUser.id}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `Server returned ${response.status}`);
      }
      
      const data = await response.json();
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format');
      }
      
      setNotifications(data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setError(error.message || 'Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d`;
    if (hours > 0) return `${hours}h`;
    if (minutes > 0) return `${minutes}m`;
    return 'now';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <h1 className="text-xl font-semibold">Notifications</h1>
          </div>

          {isLoading ? (
            <div className="p-8 text-center text-gray-500">Loading notifications...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">
              {error}
              <button 
                onClick={fetchNotifications}
                className="block mx-auto mt-2 text-blue-500 hover:text-blue-700"
              >
                Try again
              </button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No notifications yet</div>
          ) : (
            <div className="divide-y divide-gray-200">
              {notifications.map((notification) => (
                <div 
                  key={notification.id}
                  className={`p-4 hover:bg-gray-50 cursor-pointer ${!notification.read ? 'bg-blue-50' : ''}`}
                  onClick={() => {
                    markAsRead(notification.id);
                    if (notification.post) {
                      navigate(`/posts/${notification.post.id}`);
                    }
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center overflow-hidden">
                        {notification.profilePicture ? (
                          <img
                            src={notification.profilePicture}
                            alt={notification.username}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-medium text-orange-500">
                            {notification.username.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <div>
                          <p className="text-sm">
                            <span className="font-semibold">{notification.username}</span>
                            {' '}
                            {notification.type === 'LIKE' ? 'liked your post' : 'commented on your post'}
                            {notification.type === 'COMMENT' && notification.content && (
                              <span className="text-gray-500"> - "{notification.content}"</span>
                            )}
                          </p>
                          <span className="text-xs text-gray-500">
                            {formatTime(notification.createdAt)}
                          </span>
                        </div>
                        {notification.post?.thumbnailUrl && (
                          <div className="flex-shrink-0 ml-4">
                            <img
                              src={notification.post.thumbnailUrl}
                              alt=""
                              className="h-12 w-12 object-cover rounded"
                            />
                          </div>
                        )}
                      </div>
                      {notification.post?.title && (
                        <p className="mt-1 text-sm text-gray-500">
                          on your post: {notification.post.title}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationList;
