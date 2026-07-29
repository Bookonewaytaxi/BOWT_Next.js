import { useEffect } from 'react';
import { useRouter } from 'next/router';
import '@/index.css';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/SupabaseAuthContext';
import GTMInitializer from '@/components/GTMInitializer';
import MarketingScriptsInjector from '@/components/MarketingScriptsInjector';
import { initializeGTM, trackPageView } from '@/utils/gtm';

export default function App({ Component, pageProps }) {
  const router = useRouter();

  // Initialize GTM once on app load (same as the old App.jsx useEffect).
  useEffect(() => {
    initializeGTM();
  }, []);

  // Old app tracked page views via React Router's useLocation() inside a
  // <PageViewTracker>. next/router's routeChangeComplete event is the
  // Pages Router equivalent, plus we track the very first page load too.
  useEffect(() => {
    trackPageView(router.asPath);

    const handleRouteChange = (url) => trackPageView(url);
    router.events.on('routeChangeComplete', handleRouteChange);
    return () => router.events.off('routeChangeComplete', handleRouteChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AuthProvider>
      <GTMInitializer />
      <MarketingScriptsInjector />
      <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-white font-sans">
        <Component {...pageProps} />
        <Toaster />
      </div>
    </AuthProvider>
  );
}
