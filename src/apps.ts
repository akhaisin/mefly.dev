import { getCollection, getEntry } from 'astro:content';

export interface App {
  id: string;
  label: string;
  description?: string;
  iconUrl: string;
  href?: string;
  iframeUrl?: string;
  iframeUrlLocal?: string;
  devOnly?: boolean;
  wip?: boolean;
  urlSync?: boolean;
  menuMode?: 'host' | 'delegate';
  ogDescription?: string;
  ogImage?: string;
  ogImageWidth?: number;
  ogImageHeight?: number;
}

export function resolveIframeSrc(app: App, isDev: boolean): string | undefined {
  if (isDev) {
    return app.iframeUrlLocal ?? app.iframeUrl;
  }
  return app.iframeUrl;
}

export function isDevOnly(app: App): boolean {
  if (typeof app.devOnly === 'boolean') {
    return app.devOnly;
  }
  return !app.iframeUrl && !!app.iframeUrlLocal;
}

export function resolveAppHref(app: App, isDev: boolean): string | undefined {
  if (app.href) {
    return !isDev && isDevOnly(app) ? undefined : app.href;
  }

  return resolveIframeSrc(app, isDev)
    ? `/apps/${app.id}`
    : undefined;
}

export function isEmbeddableApp(app: App): boolean {
  return Boolean(app.iframeUrl || app.iframeUrlLocal);
}

export async function getAllApps(): Promise<App[]> {
  const entries = await getCollection('apps');
  return entries.map((e) => ({ id: e.id, ...e.data }));
}

export async function getApp(id: string): Promise<App | undefined> {
  const entry = await getEntry('apps', id);
  return entry ? { id: entry.id, ...entry.data } : undefined;
}

export async function navItemsFor(currentId: string, origin: string) {
  const apps = await getAllApps();
  const isDev = import.meta.env.DEV;
  const homeItem = {
    id: 'home',
    label: 'Home',
    iconUrl: `${origin}/favicon.svg`,
    url: origin,
  };

  return [
    homeItem,
    ...apps
      .filter((a) => a.id !== currentId)
      .map((a) => {
        const href = resolveAppHref(a, isDev);
        // Absolutize against the host origin. The menu may be rendered inside a
        // cross-origin iframe (delegate mode), where a relative href would
        // resolve against the iframe's origin instead of the host's.
        const url = href ? new URL(href, origin).href : '#';

        return {
          id: a.id,
          label: a.label,
          iconUrl: a.iconUrl,
          url,
          disabled: !href,
          devOnly: isDevOnly(a),
        };
      }),
  ];
}
