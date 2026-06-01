import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { isTrusted, DEFAULT_TRUSTED_ORIGINS } from './utils';

export function useHostSync(
  trustedOrigins: string[] = DEFAULT_TRUSTED_ORIGINS,
  allowLocalhost: boolean = true,
): void {
  const location = useLocation();
  const navigate = useNavigate();

  // React Router navigates via history.pushState which does not trigger
  // the native hashchange event — fire on location object instead.
  // pathname is included so the host can detect or restore cross-page navigation
  // without needing cross-origin contentWindow.location access.
  useEffect(() => {
    if (window.parent === window) return;
    window.parent.postMessage(
      { type: 'HASH_CHANGED', hash: location.hash, pathname: location.pathname },
      '*',
    );
  }, [location]);

  useEffect(() => {
    if (window.parent === window) return;

    function handleMessage(event: MessageEvent): void {
      if (!isTrusted(event.origin, trustedOrigins, allowLocalhost)) return;
      if (event.data?.type !== 'NAVIGATE_TO_HASH') return;
      if (event.data.hash === undefined) return;

      const value: string = event.data.hash;
      const normalized = value.startsWith('#') ? value.slice(1) : value;

      if (normalized.startsWith('/')) {
        // Value is a pathname — use React Router so the correct route renders.
        navigate(normalized);
      } else {
        // Value is a hash fragment — update the browser hash directly.
        const next = `#${normalized}`;
        if (window.location.hash !== next) window.location.hash = next;
      }
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [trustedOrigins, allowLocalhost, navigate]);
}
