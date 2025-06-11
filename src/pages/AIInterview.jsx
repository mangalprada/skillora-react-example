import { useState, useEffect, useRef } from 'react';

const iframeUrl = 'https://embed.skillora.ai/ai-interview?partner_id=gpvc';

const ALLOWED_DOMAINS = [
  'http://localhost:3001',
  'http://localhost:3000',
  'https://skillora.ai',
  'https://embed.skillora.ai',
];

const API_KEY = import.meta.env.VITE_SKILLORA_API_KEY;

const AIInterview = () => {
  const [loading, setLoading] = useState(true);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const iframeRef = useRef(null);
  const [isTokenLoading, setIsTokenLoading] = useState(false);

  // Handle postMessage communication with iframe
  useEffect(() => {
    const handleMessage = async (event) => {
      // Verify origin for security
      if (!ALLOWED_DOMAINS.some((domain) => event.origin.startsWith(domain))) {
        console.warn('Message from unauthorized origin:', event.origin);
        return;
      }

      // Handle TOKEN_EXPIRED request from iframe
      if (event.data?.type === 'TOKEN_EXPIRED') {
        console.log('Received TOKEN_EXPIRED from iframe');

        if (isTokenLoading) {
          console.log('Token generation already in progress...');
          return;
        }

        try {
          console.log('Generating token for iframe authentication...');
          setIsTokenLoading(true);
          const response = await fetchToken({
            email: 'test@test.com',
            first_name: 'Test',
            last_name: 'Test',
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
            console.log('Token sent to iframe immediately:', tokenMessage);
          }
        } catch (error) {
          console.error('Error generating token:', error);
        } finally {
          setIsTokenLoading(false);
        }
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [isTokenLoading]);

  // TODO: YOU MUST HANDLE THIS LOGIC IN THE BACKEND. THIS IS JUST FOR DEMO PURPOSES.
  const fetchToken = async ({ email, first_name, last_name }) => {
    console.log('Fetching token...');
    console.log('API_KEY:', API_KEY);
    const response = await fetch(
      'https://api.skillora.ai/api/authenticate-organization-user/',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, first_name, last_name }),
      }
    );
    const data = await response.json();
    return data;
  };

  const handleIframeLoad = () => {
    setIframeLoaded(true);
    setLoading(false);
    console.log('Iframe loaded successfully');
  };

  // Container fills the viewport (below header)
  return (
    <div className="fixed inset-0 top-24 flex flex-col">
      {loading && (
        <div className="absolute inset-0 flex justify-center items-center bg-white text-primary-6 z-50">
          Loading...
        </div>
      )}
      <iframe
        ref={iframeRef}
        src={iframeUrl}
        className={`w-full h-full flex-1 border-none transition-opacity duration-300 ${
          iframeLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        allow="camera; microphone; display-capture; autoplay; clipboard-write"
        title="Skillora Practice Platform"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-downloads allow-modals"
        onLoad={handleIframeLoad}
      />
    </div>
  );
};

export default AIInterview;
