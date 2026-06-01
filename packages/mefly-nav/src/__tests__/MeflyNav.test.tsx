import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { MeflyNav } from '../MeflyNav';
import type { MeflyNavItem } from '../types';

afterEach(() => cleanup());

const items: MeflyNavItem[] = [
  { id: 'a', label: 'Alpha', iconUrl: '', url: '/alpha' },
  { id: 'b', label: 'Beta', iconUrl: '', url: '/beta' },
  { id: 'off', label: 'Offline', iconUrl: '', url: '', disabled: true },
];

function openMenu() {
  fireEvent.click(screen.getByRole('button', { name: /navigation menu/i }));
}

describe('MeflyNav', () => {
  it('hides menu by default', () => {
    render(<MeflyNav items={items} />);
    expect(screen.queryByText('Alpha')).toBeNull();
  });

  it('shows menu when trigger is clicked', () => {
    render(<MeflyNav items={items} />);
    openMenu();
    expect(screen.queryByText('Alpha')).not.toBeNull();
  });

  it('closes menu on second trigger click', () => {
    render(<MeflyNav items={items} />);
    openMenu();
    openMenu();
    expect(screen.queryByText('Alpha')).toBeNull();
  });

  it('closes menu when clicking outside (click mode)', () => {
    render(<MeflyNav items={items} />);
    openMenu();
    fireEvent.mouseDown(document.body);
    expect(screen.queryByText('Alpha')).toBeNull();
  });

  it('closes menu on Escape key (click mode)', () => {
    render(<MeflyNav items={items} />);
    openMenu();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByText('Alpha')).toBeNull();
  });

  it('does not close on Escape in hover mode', () => {
    render(<MeflyNav items={items} activationMode="hover" />);
    const root = screen.getByRole('button').parentElement!;
    fireEvent.mouseEnter(root);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByText('Alpha')).not.toBeNull();
  });

  it('does not close on outside click in hover mode', () => {
    render(<MeflyNav items={items} activationMode="hover" />);
    const root = screen.getByRole('button').parentElement!;
    fireEvent.mouseEnter(root);
    fireEvent.mouseDown(document.body);
    expect(screen.queryByText('Alpha')).not.toBeNull();
  });

  it('renders disabled item as span, not a link', () => {
    render(<MeflyNav items={items} />);
    openMenu();
    const el = screen.queryByText('Offline');
    expect(el?.tagName).toBe('SPAN');
  });

  it('applies active class to the matching item', () => {
    render(<MeflyNav items={items} activeId="b" />);
    openMenu();
    const link = screen.getByText('Beta').closest('a');
    expect(link?.className).toMatch(/active/);
    expect(screen.getByText('Alpha').closest('a')?.className).not.toMatch(/active/);
  });

  it('calls onSelect and closes the menu when an item is clicked', () => {
    const onSelect = vi.fn();
    render(<MeflyNav items={items} onSelect={onSelect} />);
    openMenu();
    fireEvent.click(screen.getByText('Alpha'));
    expect(onSelect).toHaveBeenCalledOnce();
    expect(onSelect).toHaveBeenCalledWith(items[0]);
    expect(screen.queryByText('Alpha')).toBeNull();
  });

  it('closes menu on item click even without onSelect', () => {
    render(<MeflyNav items={items} />);
    openMenu();
    fireEvent.click(screen.getByText('Alpha'));
    expect(screen.queryByText('Alpha')).toBeNull();
  });
});
