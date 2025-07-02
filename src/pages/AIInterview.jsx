import { useSkilloraIframe } from '../../lib/hooks/use-skillora-iframe';

const BASE_IFRAME_URL =
  'https://skillora.ai/embed/ai-interview?organization_id=c160c143-ed0b-46cf-b1de-1d10381edc2e';

const Page = () => {
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
          Loading...
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
          <span className="text-white">Loading...</span>
        </div>
      )}
    </div>
  );
};

export default Page;
