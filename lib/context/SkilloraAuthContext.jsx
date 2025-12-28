import React, { createContext, useContext, useState, useCallback } from 'react';

const SkilloraAuthContext = createContext({
  token: null,
  userData: null,
  interviewStats: null,
  isTokenLoading: false,
  generateSkilloraAuthToken: () => Promise.resolve({}),
  createCustomInterview: () => Promise.resolve(null),
});

export const useSkilloraAuth = () => useContext(SkilloraAuthContext);

const SKILLORA_API_KEY = import.meta.env.VITE_SKILLORA_API_KEY;

export const SkilloraAuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isTokenLoading, setTokenLoading] = useState(false);

  const generateSkilloraAuthToken = useCallback(
    async ({ email, first_name, last_name }) => {
      // This authenticates the user based on the email, first_name, and last_name
      // If the user is not found, it creates a new user and returns the token and the user data
      // returns the token and the user data
      // The token is used to authenticate the user in the iframe. Token needs to be sent to the iframe in the postMessage function for security reasons.
      // The user data is used to display the user data in the iframe

      setTokenLoading(true);
      try {
        const response = await fetch(
          'https://api.skillora.ai/v1/partners/auth/users/',
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
          const errorText = await response.text();
          console.error('Auth response error:', errorText);
          throw new Error(
            `Failed to generate Skillora auth token: ${response.status} ${errorText}`
          );
        }
        const data = await response.json();
        console.log('Auth success, setting token and user data');
        setToken(data.tokens.access);
        setUserData(data.user_data);
        return data;
      } catch (error) {
        console.error('Error in generateSkilloraAuthToken:', error);
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
      resume,
    }) => {
      // This creates a custom interview for the user based on the details provided
      // returns the interview url and the token
      // The token is used to authenticate the user in the iframe. Token needs to be sent to the iframe in the postMessage function for security reasons.
      // The interview url is used to display the interview in the iframe
      try {
        const response = await fetch(
          `https://api.skillora.ai/v1/partners/mock-interviews/`,
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
              number_of_questions: 5,
              resume,
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

  const value = {
    token,
    userData,
    isTokenLoading,
    generateSkilloraAuthToken,
    createCustomInterview,
  };

  return (
    <SkilloraAuthContext.Provider value={value}>
      {children}
    </SkilloraAuthContext.Provider>
  );
};
