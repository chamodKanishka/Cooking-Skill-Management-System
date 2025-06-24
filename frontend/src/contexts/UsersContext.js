import React, { createContext, useContext, useState } from 'react';
import api from '../services/axiosConfig';

const UsersContext = createContext();

export function useUsers() {
  return useContext(UsersContext);
}

export function UsersProvider({ children }) {
  const [users, setUsers] = useState({});
  const [loadingUsers, setLoadingUsers] = useState({});

  const fetchUser = async (userId) => {
    // Don't fetch if already loading or loaded
    if (users[userId] || loadingUsers[userId]) return;

    setLoadingUsers(prev => ({ ...prev, [userId]: true }));
    try {
      const response = await api.get(`/api/users/${userId}`);
      setUsers(prev => ({ ...prev, [userId]: response.data }));
    } catch (error) {
      console.error(`Error fetching user ${userId}:`, error);
    } finally {
      setLoadingUsers(prev => ({ ...prev, [userId]: false }));
    }
  };

  return (
    <UsersContext.Provider value={{ users, fetchUser }}>
      {children}
    </UsersContext.Provider>
  );
}
