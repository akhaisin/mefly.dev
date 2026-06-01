import { describe, it, expect } from 'vitest';
import { isTrusted } from '../utils';

describe('isTrusted', () => {
  it('returns true for exact origin match', () => {
    expect(isTrusted('https://example.com', ['https://example.com'], false)).toBe(true);
  });

  it('returns false for unlisted origin', () => {
    expect(isTrusted('https://evil.com', ['https://example.com'], false)).toBe(false);
  });

  it('returns false when trusted list is empty and allowLocalhost is false', () => {
    expect(isTrusted('https://example.com', [], false)).toBe(false);
  });

  it('returns true for http localhost when allowLocalhost is true', () => {
    expect(isTrusted('http://localhost', [], true)).toBe(true);
  });

  it('returns true for localhost with port when allowLocalhost is true', () => {
    expect(isTrusted('http://localhost:3000', [], true)).toBe(true);
    expect(isTrusted('https://localhost:8080', [], true)).toBe(true);
  });

  it('returns false for localhost when allowLocalhost is false', () => {
    expect(isTrusted('http://localhost:3000', [], false)).toBe(false);
  });

  it('does not match non-localhost domains when only allowLocalhost is set', () => {
    expect(isTrusted('https://example.com', [], true)).toBe(false);
  });

  it('trustedOrigins match takes priority over allowLocalhost false', () => {
    expect(isTrusted('https://example.com', ['https://example.com'], false)).toBe(true);
  });
});
