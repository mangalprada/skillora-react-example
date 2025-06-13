import React, { createContext, useContext, useState, useCallback } from 'react';

const SkilloraAuthContext = createContext({
  token: null,
  userData: null,
  interviewStats: null,
  isTokenLoading: false,
  generateSkilloraAuthToken: () => Promise.resolve({}),
  getSkilloraInterviewStats: () => Promise.resolve(),
  createCustomInterview: () => Promise.resolve(null),
});

export const useSkilloraAuth = () => useContext(SkilloraAuthContext);

const SKILLORA_API_KEY = import.meta.env.VITE_SKILLORA_API_KEY;

export const SkilloraAuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [userData, setUserData] = useState(null);
  const [interviewStats, setInterviewStats] = useState(null);
  const [isTokenLoading, setTokenLoading] = useState(false);

  const generateSkilloraAuthToken = useCallback(
    async ({ email, first_name, last_name }) => {
      setTokenLoading(true);
      try {
        const response = await fetch(
          'https://api.skillora.ai/api/authenticate-organization-user/',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${SKILLORA_API_KEY}`, // This for demo purposes only. Do not use API key in client side.
            },
            body: JSON.stringify({ email, first_name, last_name }),
          }
        );
        if (!response.ok) {
          throw new Error('Failed to generate Skillora auth token');
        }
        const data = await response.json();
        setToken(data.tokens.access);
        setUserData(data.user_data);
        return data;
      } catch (error) {
        console.error(error);
        // We are re-throwing the error so that the caller can handle it
        throw error;
      } finally {
        setTokenLoading(false);
      }
    },
    []
  );

  const createCustomInterview = useCallback(
    async ({
      email,
      focus_area,
      topic,
      difficulty_level,
      target_company,
      additional_customization,
    }) => {
      // This is just a placeholder as we don't have base url
      // and this function is not used in the iframe hook
      // but was present in the original apislice.js
      try {
        const response = await fetch(
          `https://api.skillora.ai/api/organization-mock-interview/`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${SKILLORA_API_KEY}`, // This for demo purposes only. Do not use API key in client side.
            },
            body: JSON.stringify({
              email,
              focus_area,
              topic,
              difficulty_level,
              target_company,
              additional_customization,
            }),
          }
        );
        if (!response.ok) {
          throw new Error('Failed to create custom interview');
        }
        const data = await response.json();
        if (data.tokens && data.tokens.access) {
          setToken(data.tokens.access);
        }
        return data;
      } catch (error) {
        console.error(error);
        // We are re-throwing the error so that the caller can handle it
        throw error;
      }
    },
    []
  );

  const getSkilloraInterviewStats = useCallback(
    async ({ userId, email }) => {
      // This is just a placeholder as we don't have base url
      // and this function is not used in the iframe hook
      // but was present in the original apislice.js
      try {
        const response = await fetch(
          `https://api.skillora.ai/api/skillora_stats/by-user/${userId}/`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ email }),
          }
        );
        if (!response.ok) {
          throw new Error('Failed to fetch interview stats');
        }
        const data = await response.json();
        setInterviewStats(data);
      } catch (error) {
        console.error(error);
      }
    },
    [token]
  );

  const value = {
    token,
    userData,
    interviewStats,
    isTokenLoading,
    generateSkilloraAuthToken,
    getSkilloraInterviewStats,
    createCustomInterview,
  };

  return (
    <SkilloraAuthContext.Provider value={value}>
      {children}
    </SkilloraAuthContext.Provider>
  );
};
