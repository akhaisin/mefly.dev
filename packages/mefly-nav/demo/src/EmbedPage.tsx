import { useRef, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import type { MeflyNavItem } from 'mefly-nav';
import { pageIcon, disabledIcon, PAGE_LABELS } from './icons';
import styles from './EmbedPage.module.css';

export default function EmbedPage() {
  const { num = '1' } = useParams();
  const pageNum = parseInt(num);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const items: MeflyNavItem[] = useMemo(
    () => [
      ...[1, 2, 3]
        .filter((n) => n !== pageNum)
        .map((n) => ({
          id: `page${n}`,
          label: PAGE_LABELS[n - 1],
          iconUrl: pageIcon(n),
          url: `/page/${n}`,
        })),
      { id: 'coming-soon', label: 'Coming Soon', iconUrl: disabledIcon(), url: '', disabled: true },
    ],
    [pageNum],
  );

  // Send MEFLY_MENU after inner iframe loads.
  // Use '*' as target origin — the embedded page may be on a different domain.
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    function onLoad() {
      const msg = { type: 'MEFLY_MENU', activeId: `page${pageNum}`, items };
      iframe!.contentWindow?.postMessage(msg, '*');
      window.parent.postMessage({ type: 'DEMO_EVENT', label: 'MEFLY_MENU', detail: `→ page${pageNum}` }, '*');
    }

    iframe.addEventListener('load', onLoad);
    return () => iframe.removeEventListener('load', onLoad);
  }, [pageNum, items]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    function onMessage(e: MessageEvent) {
      if (e.source !== iframe!.contentWindow) return;

      // User clicked a nav item inside the embedded page. e.source comparison
      // works cross-origin; we never read contentWindow.location directly.
      if (e.data?.type === 'MEFLY_NAV_SELECT') {
        const item = e.data.item as MeflyNavItem;
        const match = item.url.match(/\/page\/(\d+)/);
        if (match) {
          window.parent.postMessage({ type: 'DEMO_NAVIGATE', page: parseInt(match[1]) }, '*');
        }
        return;
      }

      // Propagate within-page hash changes up to this frame's URL.
      if (e.data?.type === 'HASH_CHANGED') {
        const hash: string = e.data.hash ?? '';
        if (!hash) return;
        const next = hash.startsWith('#') ? hash : `#${hash}`;
        if (window.location.hash !== next) window.location.hash = next;
      }
    }

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [pageNum]);

  return (
    <div className={styles.embed}>
      <iframe
        ref={iframeRef}
        src={`/page/${pageNum}`}
        title={`Page ${pageNum}`}
        className={styles.iframe}
      />
    </div>
  );
}
