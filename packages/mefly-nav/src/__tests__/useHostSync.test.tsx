import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act, cleanup, screen } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { useHostSync } from '../useHostSync';

function LocationDisplay() {
  const loc = useLocation();
  return <span data-testid="path">{loc.pathname}</span>;
}

function TestComponent({
  trustedOrigins,
  allowLocalhost,
}: {
  trustedOrigins?: string[];
  allowLocalhost?: boolean;
}) {
  useHostSync(trustedOrigins, allowLocalhost);
  return null;
}

function postMessage(data: unknown, origin = 'http://localhost:3000') {
  act(() => {
    window.dispatchEvent(new MessageEvent('message', { data, origin }));
  });
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  window.location.hash = '';
});

describe('useHostSync', () => {
  describe('when embedded (window.parent !== window)', () => {
    let mockPostMessage: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      mockPostMessage = vi.fn();
      vi.spyOn(window, 'parent', 'get').mockReturnValue({
        postMessage: mockPostMessage,
      } as unknown as Window);
    });

    it('posts HASH_CHANGED with hash and pathname on mount', () => {
      render(
        <MemoryRouter initialEntries={[{ pathname: '/page/1', hash: '#tab/2' }]}>
          <TestComponent />
        </MemoryRouter>,
      );
      expect(mockPostMessage).toHaveBeenCalledWith(
        { type: 'HASH_CHANGED', hash: '#tab/2', pathname: '/page/1' },
        '*',
      );
    });

    it('navigates to hash on NAVIGATE_TO_HASH from trusted origin', () => {
      render(
        <MemoryRouter>
          <TestComponent />
        </MemoryRouter>,
      );
      postMessage({ type: 'NAVIGATE_TO_HASH', hash: '#section-2' });
      expect(window.location.hash).toBe('#section-2');
    });

    it('prepends # when hash is missing the prefix', () => {
      render(
        <MemoryRouter>
          <TestComponent />
        </MemoryRouter>,
      );
      postMessage({ type: 'NAVIGATE_TO_HASH', hash: 'section-3' });
      expect(window.location.hash).toBe('#section-3');
    });

    it('ignores NAVIGATE_TO_HASH from untrusted origin', () => {
      render(
        <MemoryRouter>
          <TestComponent
            trustedOrigins={['https://trusted.com']}
            allowLocalhost={false}
          />
        </MemoryRouter>,
      );
      postMessage({ type: 'NAVIGATE_TO_HASH', hash: '#evil' }, 'https://evil.com');
      expect(window.location.hash).toBe('');
    });

    it('calls React Router navigate when hash value is a pathname', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <TestComponent />
          <LocationDisplay />
        </MemoryRouter>,
      );
      postMessage({ type: 'NAVIGATE_TO_HASH', hash: '/exercises/useState' });
      expect(screen.getByTestId('path').textContent).toBe('/exercises/useState');
      expect(window.location.hash).toBe('');
    });

    it('calls React Router navigate when hash value has a leading #/', () => {
      render(
        <MemoryRouter initialEntries={['/']}>
          <TestComponent />
          <LocationDisplay />
        </MemoryRouter>,
      );
      postMessage({ type: 'NAVIGATE_TO_HASH', hash: '#/exercises/useEffect' });
      expect(screen.getByTestId('path').textContent).toBe('/exercises/useEffect');
    });

    it('ignores messages with unknown type', () => {
      render(
        <MemoryRouter>
          <TestComponent />
        </MemoryRouter>,
      );
      postMessage({ type: 'UNKNOWN', hash: '#x' });
      expect(window.location.hash).toBe('');
    });
  });

  describe('when not embedded (window.parent === window)', () => {
    it('does not post HASH_CHANGED', () => {
      // jsdom default: window.parent === window
      const spy = vi.spyOn(window, 'postMessage');
      render(
        <MemoryRouter>
          <TestComponent />
        </MemoryRouter>,
      );
      // postMessage on window itself should not be called for HASH_CHANGED
      const hashChangedCall = spy.mock.calls.find(
        ([data]) => (data as { type?: string })?.type === 'HASH_CHANGED',
      );
      expect(hashChangedCall).toBeUndefined();
    });
  });
});
