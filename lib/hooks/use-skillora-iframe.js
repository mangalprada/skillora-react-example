import { useState, useEffect, useRef } from 'react';
import { useSkilloraAuth } from '../context/SkilloraAuthContext';
import { useAuth } from '../context/AuthContext';

const ALLOWED_DOMAINS = [
  'http://localhost:3001',
  'http://localhost:3000',
  'https://skillora.ai',
  'https://embed.skillora.ai',
];

export const useSkilloraIframe = (baseIframeUrl) => {
  const [isPageLoading, setPageLoading] = useState(true);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeUrl, setIframeUrl] = useState('');
  const iframeRef = useRef(null);

  const {
    token,
    userData: skilloraUserData,
    isTokenLoading,
    generateSkilloraAuthToken,
  } = useSkilloraAuth();

  const { user } = useAuth();

  useEffect(() => {
    const setupIframeUrl = async () => {
      if (!user) {
        return;
      }

      setPageLoading(true);

      try {
        let accessToken = token;
        let userDataPayload = skilloraUserData;

        if (!accessToken || !userDataPayload) {
          const response = await generateSkilloraAuthToken({
            email: user?.email,
            first_name: user?.first_name,
            last_name: user?.last_name,
          });
          accessToken = response.tokens.access;
          userDataPayload = response.user_data;
        }

        const urlWithToken = `${baseIframeUrl}&token=${encodeURIComponent(
          accessToken
        )}&user_data=${encodeURIComponent(JSON.stringify(userDataPayload))}`;
        setIframeUrl(urlWithToken);
      } catch (error) {
        console.error('Error preparing iframe URL:', error);
        setIframeUrl(baseIframeUrl);
      } finally {
        setPageLoading(false);
      }
    };

    setupIframeUrl();
  }, [user, token, skilloraUserData, baseIframeUrl, generateSkilloraAuthToken]);

  useEffect(() => {
    const handleMessage = async (event) => {
      if (!ALLOWED_DOMAINS.some((domain) => event.origin.startsWith(domain))) {
        return;
      }

      if (event.data?.type === 'TOKEN_EXPIRED') {
        if (!user || isTokenLoading) {
          return;
        }

        try {
          const response = await generateSkilloraAuthToken({
            email: user?.email,
            first_name: user?.first_name,
            last_name: user?.last_name,
          });

          if (iframeRef.current) {
            const tokenMessage = {
              type: 'AUTH_TOKEN',
              token: response.tokens.access,
              user_data: response.user_data,
            };
            iframeRef.current.contentWindow?.postMessage(
              tokenMessage,
              event.origin
            );
          }
        } catch (error) {
          console.error('Error generating token:', error);
        }
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [user, isTokenLoading, generateSkilloraAuthToken]);

  const handleIframeLoad = () => {
    setIframeLoaded(true);
    if (token && skilloraUserData && iframeRef.current) {
      const tokenMessage = {
        type: 'AUTH_TOKEN',
        token: token,
        user_data: skilloraUserData,
      };
      setTimeout(() => {
        iframeRef.current?.contentWindow?.postMessage(
          tokenMessage,
          'https://embed.skillora.ai'
        );
      }, 100);
    }
  };

  return {
    isPageLoading,
    iframeLoaded,
    iframeUrl,
    iframeRef,
    handleIframeLoad,
  };
};
