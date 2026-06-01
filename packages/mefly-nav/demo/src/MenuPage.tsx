import React from 'react';
import { PAGE_COLORS, PAGE_LABELS, pageIcon } from './icons';
import styles from './MenuPage.module.css';

export default function MenuPage() {
  function navigate(page: number) {
    window.parent.postMessage({ type: 'DEMO_NAVIGATE', page }, '*');
  }

  return (
    <div className={styles.page}>
      <p className={styles.hint}>Click an icon to load it in the center panel</p>
      <div className={styles.grid}>
        {[1, 2, 3].map((n) => (
          <button
            key={n}
            className={styles.icon}
            style={{ '--accent': PAGE_COLORS[n - 1] } as React.CSSProperties}
            onClick={() => navigate(n)}
          >
            <img src={pageIcon(n)} alt="" className={styles.img} />
            <span>{PAGE_LABELS[n - 1]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
