import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch } from 'react-icons/fi';
import api from '../services/axiosConfig';

const Explore = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const searchUsers = async (query) => {
    if (!query.trim()) {
      setUsers([]);
      return;
    }

    setLoading(true);
    try {
      const response = await api.get(`/api/users/search?query=${encodeURIComponent(query.trim())}`);
      
      if (response.data) {
        // Filter out any invalid user data
        const validUsers = response.data.filter(user => user && user.id);
        setUsers(validUsers);
      } else {
        setUsers([]);
      }
    } catch (error) {
      console.error('Error searching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = (user) => {
    navigate(`/dashboard/user/${user.id}`);
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery) {
        searchUsers(searchQuery);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-8">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search for users..."
            value={searchQuery}
            onChange={(e) => {
              const value = e.target.value;
              setSearchQuery(value);
              // Clear users when input is empty
              if (!value.trim()) {
                setUsers([]);
              }
            }}
            className="pl-10 w-full px-4 py-3 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition duration-200"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-4">
          <p className="text-gray-600">Searching...</p>
        </div>
      ) : searchQuery && users.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-gray-600">No users found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => (
            <div
              key={user.id}
              onClick={() => handleUserClick(user)}
              className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 p-4 cursor-pointer"
            >
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  {user.profilePicture ? (
                    <img
                      src={user.profilePicture.startsWith('data:') 
                        ? user.profilePicture 
                        : `http://localhost:8080${user.profilePicture}`}
                      alt=""
                      className="w-12 h-12 rounded-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/default-avatar.png';
                      }}
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                      <span className="text-lg font-medium text-orange-500">
                        {user.username?.charAt(0)?.toUpperCase() || '?'}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{user.fullName || user.username}</h3>
                  <p className="text-sm text-gray-500">@{user.username}</p>
                  {user.bio && <p className="mt-1 text-sm text-gray-600 line-clamp-2">{user.bio}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Explore;
