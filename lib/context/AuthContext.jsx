import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext({
  user: null,
});

export const useAuth = () => useContext(AuthContext);

// This is a mock implementation of AuthProvider
// In a real app, you would fetch the user from an API
export const AuthProvider = ({ children }) => {
  const [user] = useState({
    email: 'test.user@example.com',
    first_name: 'Test',
    last_name: 'User',
  });

  return (
    <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
  );
};
