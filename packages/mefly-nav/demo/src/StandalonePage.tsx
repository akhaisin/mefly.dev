import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useHostSync, MeflyNavReceiver } from 'mefly-nav';
import { PAGE_COLORS } from './icons';
import styles from './StandalonePage.module.css';

function parseTab(hash: string): number {
  const m = hash.match(/^#tab\/(\d+)$/);
  return m ? parseInt(m[1]) : 1;
}

export default function StandalonePage() {
  const { num = '1' } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const pageNum = parseInt(num);
  const activeTab = parseTab(location.hash);
  const color = PAGE_COLORS[(pageNum - 1) % PAGE_COLORS.length];

  useHostSync();

  return (
    <div className={styles.page} style={{ '--accent': color } as React.CSSProperties}>
      <header className={styles.header}>
        <span className={styles.badge} style={{ background: color }}>
          Page {pageNum}
        </span>
        <div className={styles.tabs}>
          {[1, 2, 3].map((t) => (
            <button
              key={t}
              className={[styles.tab, t === activeTab ? styles.active : ''].join(' ')}
              onClick={() => navigate({ hash: `#tab/${t}` })}
            >
              Tab {t}
            </button>
          ))}
        </div>
      </header>

      <div className={styles.content}>
        <p className={styles.state}>
          Page <strong>{pageNum}</strong> · Tab <strong>{activeTab}</strong>
        </p>
        <p className={styles.hint}>
          Switching tabs updates the URL hash. The right panel URL bar in the demo reflects this
          change, and a <code>HASH_CHANGED</code> event appears in the event log.
        </p>
      </div>

      <MeflyNavReceiver />
    </div>
  );
}
