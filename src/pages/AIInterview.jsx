import Loader from '@components/UI/loaders/ButtonLoader';
import EmptyState from '@components/features/student/jobs/EmptyState';
import { useSkilloraIframe } from '@hooks/use-skillora-iframe';

const BASE_IFRAME_URL =
  'https://embed.skillora.ai/ai-interview?organization_id=44af13b5-3512-44f0-a8b6-ced9433e7bb5';

const Page = () => {
  const {
    isPageLoading,
    iframeLoaded,
    iframeUrl,
    iframeRef,
    handleIframeLoad,
    hasCompletedAllCourses,
  } = useSkilloraIframe(BASE_IFRAME_URL);

  if (hasCompletedAllCourses === false) {
    return <EmptyState header="🚫 Interview Access Locked" />;
  }

  if (isPageLoading || !iframeUrl) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full h-full flex flex-col items-center justify-center"
      >
        <div className="text-primary-6 z-50 h-full w-full flex items-center justify-center">
          <Loader isLoading={true} />
        </div>
      </motion.div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-start">
      <iframe
        ref={iframeRef}
        src={iframeUrl}
        className={`w-full h-full border-none transition-opacity duration-300 ${
          iframeLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        allow="camera; microphone; display-capture; autoplay; clipboard-write"
        title="Skillora Practice Platform"
        sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-downloads allow-modals"
        onLoad={handleIframeLoad}
      />

      {!iframeLoaded && (
        <div className="text-primary-6 z-50 h-full w-full flex items-center justify-center">
          <Loader isLoading={true} />
        </div>
      )}
    </div>
  );
};

export default Page;
