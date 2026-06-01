export const DEFAULT_TRUSTED_ORIGINS: string[] = [];

export function isTrusted(origin: string, trusted: string[], allowLocalhost: boolean): boolean {
  if (trusted.includes(origin)) return true;
  if (allowLocalhost && /^https?:\/\/localhost(:\d+)?$/.test(origin)) return true;
  return false;
}
