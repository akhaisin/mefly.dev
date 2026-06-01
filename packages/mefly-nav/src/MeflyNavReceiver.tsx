import React, { useState, useEffect } from 'react';
import { MeflyNav } from './MeflyNav';
import type { MeflyNavItem } from './types';
import { isTrusted, DEFAULT_TRUSTED_ORIGINS } from './utils';

interface MeflyMenuMessage {
  type: 'MEFLY_MENU';
  activeId: string;
  items: MeflyNavItem[];
}

interface Props {
  trustedOrigins?: string[];
  allowLocalhost?: boolean;
  style?: React.CSSProperties;
  activationMode?: 'click' | 'hover';
}

export function MeflyNavReceiver({
  trustedOrigins = DEFAULT_TRUSTED_ORIGINS,
  allowLocalhost = true,
  style,
  activationMode,
}: Props) {
  const [state, setState] = useState<{ items: MeflyNavItem[]; activeId: string } | null>(null);

  useEffect(() => {
    function handleMessage(event: MessageEvent): void {
      if (!isTrusted(event.origin, trustedOrigins, allowLocalhost)) return;
      const msg = event.data as MeflyMenuMessage;
      if (msg?.type !== 'MEFLY_MENU') return;
      setState({ items: msg.items, activeId: msg.activeId });
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [trustedOrigins, allowLocalhost]);

  if (!state || state.items.length === 0) return null;

  // When embedded, intercept clicks and delegate navigation to the host via
  // MEFLY_NAV_SELECT so cross-origin parent pages can route without relying on
  // the embedded page being able to navigate to the item's URL directly.
  const isEmbedded = window.parent !== window;

  function handleSelect(item: MeflyNavItem): void {
    window.parent.postMessage({ type: 'MEFLY_NAV_SELECT', item }, '*');
  }

  return (
    <MeflyNav
      items={state.items}
      activeId={state.activeId}
      style={style}
      activationMode={activationMode}
      onSelect={isEmbedded ? handleSelect : undefined}
    />
  );
}
