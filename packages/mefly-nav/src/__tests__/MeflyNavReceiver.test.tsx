import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react';
import { MeflyNavReceiver } from '../MeflyNavReceiver';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const MENU_MESSAGE = {
  type: 'MEFLY_MENU',
  activeId: 'a',
  items: [
    { id: 'a', label: 'Alpha', iconUrl: '', url: '/alpha' },
    { id: 'b', label: 'Beta', iconUrl: '', url: '/beta' },
  ],
};

function postMessage(data: unknown, origin = 'http://localhost:3000') {
  act(() => {
    window.dispatchEvent(new MessageEvent('message', { data, origin }));
  });
}

describe('MeflyNavReceiver', () => {
  it('renders nothing before receiving a message', () => {
    const { container } = render(<MeflyNavReceiver />);
    expect(container.firstChild).toBeNull();
  });

  it('renders the nav trigger after a valid MEFLY_MENU message', () => {
    render(<MeflyNavReceiver />);
    postMessage(MENU_MESSAGE);
    expect(screen.queryByRole('button', { name: /navigation menu/i })).not.toBeNull();
  });

  it('ignores messages from untrusted origins', () => {
    render(
      <MeflyNavReceiver
        trustedOrigins={['https://trusted.com']}
        allowLocalhost={false}
      />,
    );
    postMessage(MENU_MESSAGE, 'https://evil.com');
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('ignores messages with wrong type', () => {
    render(<MeflyNavReceiver />);
    postMessage({ ...MENU_MESSAGE, type: 'OTHER' });
    expect(screen.queryByRole('button')).toBeNull();
  });

  it('renders nothing when items array is empty', () => {
    const { container } = render(<MeflyNavReceiver />);
    postMessage({ ...MENU_MESSAGE, items: [] });
    expect(container.firstChild).toBeNull();
  });

  it('posts MEFLY_NAV_SELECT to parent when embedded and item is clicked', () => {
    const mockPostMessage = vi.fn();
    vi.spyOn(window, 'parent', 'get').mockReturnValue({
      postMessage: mockPostMessage,
    } as unknown as Window);

    render(<MeflyNavReceiver />);
    postMessage(MENU_MESSAGE);

    // open menu and click first item
    fireEvent.click(screen.getByRole('button', { name: /navigation menu/i }));
    fireEvent.click(screen.getByText('Alpha'));

    expect(mockPostMessage).toHaveBeenCalledWith(
      { type: 'MEFLY_NAV_SELECT', item: MENU_MESSAGE.items[0] },
      '*',
    );
  });

  it('does not pass onSelect (follows href) when not embedded', () => {
    // window.parent === window by default in jsdom — not embedded
    const mockPostMessage = vi.fn();

    render(<MeflyNavReceiver />);
    postMessage(MENU_MESSAGE);

    fireEvent.click(screen.getByRole('button', { name: /navigation menu/i }));
    fireEvent.click(screen.getByText('Alpha'));

    expect(mockPostMessage).not.toHaveBeenCalled();
  });
});
