import React, { useState, useRef, useEffect } from 'react';
import { useSkilloraAuth } from '../../lib/context/SkilloraAuthContext';
import { useAuth } from '../../lib/context/AuthContext';

const ALLOWED_DOMAINS = [
  'http://localhost:3001',
  'http://localhost:3000',
  'https://skillora.ai',
  'https://app.skillora.ai',
];

const CreateYourOwn = () => {
  const {
    createCustomInterview,
    token,
    userData,
    generateSkilloraAuthToken,
    isTokenLoading,
  } = useSkilloraAuth();
  const { user } = useAuth();
  const [interviewUrl, setInterviewUrl] = useState('');
  const [isCreatingInterview, setIsCreatingInterview] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [authSent, setAuthSent] = useState(false);
  const iframeRef = useRef(null);

  // Extract origin from iframe URL
  const getIframeOrigin = (url) => {
    try {
      const urlObj = new URL(url);
      return urlObj.origin;
    } catch {
      return 'https://app.skillora.ai/embed'; // fallback
    }
  };

  // Handle messages from iframe
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
        console.log('Token expired, regenerating...');
        if (!user || isTokenLoading) {
          console.log(
            'Cannot regenerate token: user=',
            user,
            'isTokenLoading=',
            isTokenLoading
          );
          return;
        }

        try {
          const response = await generateSkilloraAuthToken({
            email: user?.email || 'test.user@example.com',
            first_name: user?.first_name || 'Test',
            last_name: user?.last_name || 'User',
          });

          if (iframeRef.current) {
            const tokenMessage = {
              type: 'AUTH_TOKEN',
              token: response.tokens.access,
              user_data: response.user_data,
            };
            console.log('Sending new auth token to iframe:', tokenMessage.type);
            iframeRef.current.contentWindow?.postMessage(
              tokenMessage,
              event.origin
            );
          }
        } catch (error) {
          console.error('Error generating token:', error);
        }
      }

      if (event.data?.type === 'NAVIGATE_USER') {
        const { path } = event.data;
        if (path) {
          const skilloraUrl = `https://app.skillora.ai/embed/${path}`;
          setInterviewUrl(skilloraUrl);
        } else {
          console.warn('NAVIGATE_USER message received but no URL provided');
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
      userData &&
      !authSent &&
      iframeRef.current &&
      interviewUrl
    ) {
      const iframeOrigin = getIframeOrigin(interviewUrl);
      console.log('Sending initial auth token to iframe origin:', iframeOrigin);

      const tokenMessage = {
        type: 'AUTH_TOKEN',
        token: token,
        user_data: userData,
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
  }, [iframeLoaded, token, userData, authSent, interviewUrl]);

  const handleCreateInterview = async () => {
    setIsCreatingInterview(true);

    const interviewDetails = {
      email: user?.email || 'test.user@example.com',
      focus_area: 'SKILL', // Acceptable values: SKILL, JOB, BEHAVIORAL
      topic: 'React State Management',
      difficulty_level: 2, // 1: Easy, 2: Medium, 3: Hard
      target_company: 'Meta',
      additional_customization: 'Please focus on redux and context API.',
      number_of_questions: 5,
    };

    try {
      console.log('Creating custom interview with details:', interviewDetails);
      const response = await createCustomInterview(interviewDetails);

      if (response && response.interview_url) {
        console.log('Interview created successfully:', response.interview_url);
        setInterviewUrl(response.interview_url);
        setAuthSent(false); // Reset auth sent flag for new interview
      } else {
        console.error(
          'Interview creation failed: No interview URL in response',
          response
        );
        alert(
          'Interview creation failed. The response did not contain an interview URL.'
        );
      }
    } catch (error) {
      console.error('Failed to create interview:', error);
      alert('Failed to create interview. Check the console for details.');
    } finally {
      setIsCreatingInterview(false);
    }
  };

  const handleIframeLoad = () => {
    console.log('Iframe loaded');
    setIframeLoaded(true);
  };

  // Show loading state while creating interview
  if (isCreatingInterview) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center">
        <div className="text-primary-6 z-50 h-full w-full flex items-center justify-center">
          <div className="text-center">
            <div className="mb-4">Creating your custom interview...</div>
            <div className="text-sm">
              Please wait while we prepare your interview
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show iframe if interview URL is set
  if (interviewUrl) {
    return (
      <div className="fixed inset-0 w-full h-full z-0">
        <iframe
          ref={iframeRef}
          src={interviewUrl}
          className={`absolute inset-0 w-full h-full border-none transition-opacity duration-300 ${
            iframeLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          allow="camera; microphone; display-capture; autoplay; clipboard-write"
          title="Skillora Practice Platform"
          sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-downloads allow-modals"
          onLoad={handleIframeLoad}
          style={{ minHeight: 0, minWidth: 0 }}
        />

        {!iframeLoaded && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="text-center">
              <span className="text-white block mb-2">
                Loading Interview...
              </span>
              <span className="text-white text-sm">Authenticating user...</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Show the initial form to create interview
  return (
    <div style={{ padding: '20px' }}>
      <h2>Create a Custom Mock Interview</h2>
      <p>
        Click the button below to create a custom interview with pre-filled
        details.
        <br />
        Make sure you are logged in.
      </p>
      <button
        onClick={handleCreateInterview}
        style={{
          marginTop: '10px',
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
        }}
        disabled={isCreatingInterview}
      >
        {isCreatingInterview ? 'Creating...' : 'Create Interview'}
      </button>
    </div>
  );
};

export default CreateYourOwn;
