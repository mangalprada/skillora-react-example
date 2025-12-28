import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext({
  user: null,
});

export const useAuth = () => useContext(AuthContext);

// This is a mock implementation of AuthProvider
// In a real app, you would fetch the user from an API
export const AuthProvider = ({ children }) => {
  const [user] = useState({
    email: 'john.doe@example.com',
    first_name: 'John',
    last_name: 'Doe',
  });

  return (
    <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
  );
};
