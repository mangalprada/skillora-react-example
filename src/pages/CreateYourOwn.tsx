import React, { useState, useRef } from 'react';
import { useSkilloraAuth } from '../../lib/context/SkilloraAuthContext';

const CreateYourOwn = () => {
  const { createCustomInterview, userData }: any = useSkilloraAuth();
  const [interviewUrl, setInterviewUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [token, setToken] = useState('');

  const handleCreateInterview = async () => {
    setIsLoading(true);

    const interviewDetails = {
      email: 'test.user@example.com', // To identify the user
      focus_area: 'SKILL', // Acceptable values: SKILL, JOB, BEHAVIORAL
      topic: 'React State Management',
      difficulty_level: 2, // 1: Easy, 2: Medium, 3: Hard
      target_company: 'Meta',
      additional_customization: 'Please focus on redux and context API.',
      number_of_questions: 5,
    };

    try {
      const response = await createCustomInterview(interviewDetails);

      if (response && response.interview_url) {
        const accessToken = response.tokens.access;
        setToken(accessToken);
        setInterviewUrl(response.interview_url);
      } else {
        alert(
          'Interview creation failed. The response did not contain an interview URL.'
        );
      }
    } catch (error) {
      console.error('Failed to create interview:', error);
      alert('Failed to create interview. Check the console for details.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleIframeLoad = () => {
    setIframeLoaded(true);

    // Safely send the token to the iframe
    const tokenMessage = {
      type: 'AUTH_TOKEN',
      token: token,
    };

    iframeRef.current?.contentWindow?.postMessage(
      tokenMessage,
      'https://skillora.ai'
    );
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center">
        <div className="text-primary-6 z-50 h-full w-full flex items-center justify-center">
          Creating your custom interview...
        </div>
      </div>
    );
  }

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
            <span className="text-white">Loading Interview...</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h2>Create a Custom Mock Interview</h2>
      <p>
        Click the button below to create a custom interview with pre-filled
        details.
        <br />
        Make sure you are logged in.
      </p>
      <button onClick={handleCreateInterview} style={{ marginTop: '10px' }}>
        Create Interview
      </button>
    </div>
  );
};

export default CreateYourOwn;
