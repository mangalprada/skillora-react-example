import { useSkilloraIframe } from '../../lib/hooks/use-skillora-iframe';
import { useSkilloraAuth } from '../../lib/context/SkilloraAuthContext.jsx';
import { useAuth } from '../../lib/context/AuthContext.jsx';

const BASE_IFRAME_URL =
  'https://skillora.ai/embed/my-interviews?organization_id=ORGANIZATION_ID';

const Page = () => {
  const { user } = useAuth();
  const { isTokenLoading } = useSkilloraAuth();

  const {
    isPageLoading,
    iframeLoaded,
    iframeUrl,
    iframeRef,
    handleIframeLoad,
  } = useSkilloraIframe(BASE_IFRAME_URL);

  if (isPageLoading || !iframeUrl) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center">
        <div className="text-primary-6 z-50 h-full w-full flex items-center justify-center">
          <div className="text-center">
            <div className="mb-4">Loading My Interviews...</div>
            {isTokenLoading && (
              <div className="text-sm">Generating authentication token...</div>
            )}
            {!user && <div className="text-sm text-red-500">No user found</div>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 w-full h-full z-0">
      <iframe
        ref={iframeRef}
        src={iframeUrl}
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
              Loading My Interviews...
            </span>
            <span className="text-white text-sm">Authenticating user...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;
