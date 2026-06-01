import React, { useState, useEffect, useRef } from 'react';
import type { MeflyNavItem } from './types';
import styles from './MeflyNav.module.css';

interface Props {
  items: MeflyNavItem[];
  activeId?: string;
  style?: React.CSSProperties;
  activationMode?: 'click' | 'hover';
  onSelect?: (item: MeflyNavItem) => void;
}

export function MeflyNav({ items, activeId, style, activationMode = 'click', onSelect }: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // Click-outside and ESC only apply in click mode.
  useEffect(() => {
    if (!open || activationMode !== 'click') return;
    function onMouseDown(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open, activationMode]);

  // Use native mouseenter/mouseleave for hover mode. React's synthetic
  // onMouseEnter goes through event delegation which can be unreliable inside
  // Astro islands (separate React roots per island).
  useEffect(() => {
    if (activationMode !== 'hover' || !rootRef.current) return;
    const el = rootRef.current;
    const onEnter = () => setOpen(true);
    const onLeave = () => setOpen(false);
    el.addEventListener('mouseenter', onEnter);
    el.addEventListener('mouseleave', onLeave);
    return () => {
      el.removeEventListener('mouseenter', onEnter);
      el.removeEventListener('mouseleave', onLeave);
    };
  }, [activationMode]);

  function handleItemClick(e: React.MouseEvent, item: MeflyNavItem) {
    if (onSelect) {
      e.preventDefault();
      onSelect(item);
    }
    setOpen(false);
  }

  return (
    <div ref={rootRef} className={styles.root} style={style}>
      {open && (
        <ul className={styles.menu}>
          {items.map((item) => (
            <li key={item.id}>
              {item.disabled ? (
                <span className={`${styles.item} ${styles.disabled}`}>
                  <img src={item.iconUrl} alt="" className={styles.icon} />
                  <span className={styles.label}>{item.label}</span>
                </span>
              ) : (
                <a
                  href={item.url}
                  className={[
                    styles.item,
                    item.devOnly ? styles.devOnly : '',
                    item.id === activeId ? styles.active : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  onClick={(e) => handleItemClick(e, item)}
                >
                  <img src={item.iconUrl} alt="" className={styles.icon} />
                  <span className={styles.label}>{item.label}</span>
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
      <button
        className={styles.trigger}
        onClick={activationMode === 'click' ? () => setOpen((o) => !o) : undefined}
        aria-label="Open navigation menu"
        aria-expanded={open}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <rect x="1" y="1" width="6" height="6" rx="1" />
          <rect x="9" y="1" width="6" height="6" rx="1" />
          <rect x="1" y="9" width="6" height="6" rx="1" />
          <rect x="9" y="9" width="6" height="6" rx="1" />
        </svg>
      </button>
    </div>
  );
}
