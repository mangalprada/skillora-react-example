import { useState, useEffect, useRef } from 'react';
import { useSkilloraAuth } from '../context/SkilloraAuthContext';
import { useAuth } from '../context/AuthContext';

const ALLOWED_DOMAINS = [
  'http://localhost:3001',
  'http://localhost:3000',
  'https://skillora.ai',
  'https://app.skillora.ai',
];

export const useSkilloraIframe = (baseIframeUrl) => {
  const [isPageLoading, setPageLoading] = useState(true);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeUrl, setIframeUrl] = useState('');
  const [authSent, setAuthSent] = useState(false);
  const iframeRef = useRef(null);

  const {
    token,
    userData: skilloraUserData,
    isTokenLoading,
    generateSkilloraAuthToken,
  } = useSkilloraAuth();

  const { user } = useAuth();

  // Extract origin from iframe URL
  const getIframeOrigin = (url) => {
    try {
      const urlObj = new URL(url);
      return urlObj.origin;
    } catch {
      return 'https://app.skillora.ai/embed'; // fallback
    }
  };

  useEffect(() => {
    const setupIframeUrl = async () => {
      if (!user) {
        return;
      }

      setPageLoading(true);
      setAuthSent(false);

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

        setIframeUrl(baseIframeUrl);
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
      console.log(
        'Received message from iframe:',
        event.data,
        'from origin:',
        event.origin
      );

      if (!ALLOWED_DOMAINS.some((domain) => event.origin.startsWith(domain))) {
        console.log('Message from non-allowed domain, ignoring');
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

  // Send initial auth token after iframe loads
  useEffect(() => {
    if (
      iframeLoaded &&
      token &&
      skilloraUserData &&
      !authSent &&
      iframeRef.current
    ) {
      const iframeOrigin = getIframeOrigin(iframeUrl);
      console.log('Sending initial auth token to iframe origin:', iframeOrigin);

      const tokenMessage = {
        type: 'AUTH_TOKEN',
        token: token,
        user_data: skilloraUserData,
      };

      // Add multiple attempts with delays to ensure iframe is ready
      const sendAuthMessage = (attempt = 0) => {
        if (attempt > 5) return; // Max 5 attempts

        setTimeout(() => {
          if (iframeRef.current?.contentWindow) {
            console.log(`Sending auth message attempt ${attempt + 1}`);
            iframeRef.current.contentWindow.postMessage(
              tokenMessage,
              iframeOrigin
            );
            if (attempt === 0) {
              setAuthSent(true);
            }
          }
        }, attempt * 200); // 0ms, 200ms, 400ms, 600ms, 800ms, 1000ms
      };

      sendAuthMessage(0);
      sendAuthMessage(1);
      sendAuthMessage(2);
    }
  }, [iframeLoaded, token, skilloraUserData, authSent, iframeUrl]);

  const handleIframeLoad = () => {
    setIframeLoaded(true);
  };

  return {
    isPageLoading,
    iframeLoaded,
    iframeUrl,
    iframeRef,
    handleIframeLoad,
  };
};
