import React, { useRef, useEffect, useState, useCallback } from 'react';
import styles from './Demo.module.css';

type LogEvent = { label: string; from: string; detail: string; ts: number };

function getUrl(iframe: HTMLIFrameElement | null): string {
  try {
    const loc = iframe?.contentWindow?.location;
    return loc ? loc.pathname + loc.hash : '';
  } catch {
    return '';
  }
}

export default function Demo() {
  const [activePage, setActivePage] = useState(1);
  const [urlBars, setUrlBars] = useState({ left: '/menu', center: '/embed/1', right: '/page/1' });
  const [log, setLog] = useState<LogEvent[]>([]);

  const leftRef = useRef<HTMLIFrameElement>(null);
  const centerRef = useRef<HTMLIFrameElement>(null);
  const rightRef = useRef<HTMLIFrameElement>(null);

  const addLog = useCallback((entry: Omit<LogEvent, 'ts'>) => {
    setLog((prev) => [{ ...entry, ts: Date.now() }, ...prev].slice(0, 6));
  }, []);

  // Poll iframe URLs
  useEffect(() => {
    const id = setInterval(() => {
      setUrlBars({
        left: getUrl(leftRef.current) || '/menu',
        center: getUrl(centerRef.current) || `/embed/${activePage}`,
        right: getUrl(rightRef.current) || `/page/${activePage}`,
      });
    }, 200);
    return () => clearInterval(id);
  }, [activePage]);

  // Listen for postMessages from child iframes
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      const data = e.data;
      if (!data?.type) return;

      if (data.type === 'DEMO_NAVIGATE') {
        setActivePage(data.page);
        addLog({ label: 'DEMO_NAVIGATE', from: 'menu', detail: `page → ${data.page}` });
      } else if (data.type === 'DEMO_EVENT') {
        addLog({ label: data.label, from: 'embed', detail: data.detail });
      } else if (data.type === 'HASH_CHANGED') {
        addLog({ label: 'HASH_CHANGED', from: 'standalone', detail: data.hash || '(empty)' });
      }
    }
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [addLog]);

  const centerSrc = `/embed/${activePage}`;
  const rightSrc = `/page/${activePage}`;

  return (
    <div className={styles.shell}>
      <header className={styles.titleBar}>
        <span className={styles.title}>mefly-nav</span>
        <span className={styles.subtitle}>demo</span>
      </header>

      <div className={styles.panels}>
        <BrowserPanel label="Menu" url={urlBars.left}>
          <iframe ref={leftRef} src="/menu" title="Menu" className={styles.iframe} />
        </BrowserPanel>

        <BrowserPanel label={`Embed ${activePage}`} url={urlBars.center}>
          <iframe
            ref={centerRef}
            key={centerSrc}
            src={centerSrc}
            title={`Embed ${activePage}`}
            className={styles.iframe}
          />
        </BrowserPanel>

        <BrowserPanel label={`Page ${activePage} (standalone)`} url={urlBars.right}>
          <iframe
            ref={rightRef}
            key={rightSrc}
            src={rightSrc}
            title={`Page ${activePage} standalone`}
            className={styles.iframe}
          />
        </BrowserPanel>
      </div>

      <div className={styles.logPanel}>
        <span className={styles.logTitle}>Event log</span>
        {log.length === 0 ? (
          <span className={styles.logEmpty}>
            Click an icon in the menu, or switch tabs in the right panel.
          </span>
        ) : (
          log.map((e, i) => (
            <div key={i} className={styles.logRow}>
              <code className={styles.logType}>{e.label}</code>
              <span className={styles.logFrom}>{e.from}</span>
              <span className={styles.logDetail}>{e.detail}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function BrowserPanel({
  label,
  url,
  children,
}: {
  label: string;
  url: string;
  children: React.ReactNode;
}) {
  return (
    <div className={styles.panel}>
      <div className={styles.urlBar}>
        <div className={styles.dots}>
          <span /><span /><span />
        </div>
        <div className={styles.urlChip}>
          <span className={styles.urlText}>{url}</span>
        </div>
      </div>
      <div className={styles.frameWrap}>{children}</div>
    </div>
  );
}
