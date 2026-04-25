export interface App {
  id: string;
  label: string;
  iconUrl: string;
  href?: string;
  iframeUrl?: string;
  iframeUrlLocal?: string;
  devOnly?: boolean;
  urlSync?: boolean;
  menuMode?: 'host' | 'delegate';
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

export const apps: App[] = [
  {
    id: 'articles',
    label: 'Articles',
    iconUrl: 'https://mefly.dev/favicon.svg',
    href: '/articles',
    devOnly: true,
  },
  {
    id: 'track-builder',
    label: 'Track Builder',
    iconUrl: 'https://akhaisin.github.io/track-builder/favicon.svg',
    iframeUrl: 'https://akhaisin.github.io/track-builder/',
    iframeUrlLocal: 'http://localhost:5173/track-builder/',
    urlSync: true,
    devOnly: true,
    menuMode: 'delegate',
  },
  {
    id: 'crsf-tester',
    label: 'CRSF Tester',
    iconUrl: 'https://akhaisin.github.io/crsf-tester/favicon.svg',
    iframeUrl: 'https://akhaisin.github.io/crsf-tester/',
    iframeUrlLocal: 'http://localhost:5173/crsf-tester/',
    devOnly: true,
    menuMode: 'delegate',
  },
  {
    id: 'learning-react',
    label: 'Learning React',
    iconUrl: 'https://akhaisin.github.io/learning-react/favicon.svg',
    iframeUrl: 'https://akhaisin.github.io/learning-react/',
    iframeUrlLocal: 'http://localhost:5175/learning-react/',
    urlSync: true,
    menuMode: 'delegate',
  },
];

export function getApp(id: string): App | undefined {
  return apps.find((a) => a.id === id);
}

export function navItemsFor(currentId: string, isDev: boolean) {
  const homeItem = {
    id: 'home',
    label: 'Home',
    iconUrl: 'https://mefly.dev/favicon.svg',
    url: isDev ? 'http://localhost:4321' : 'https://mefly.dev',
  };

  return [
    homeItem,
    ...apps
      .filter((a) => a.id !== currentId)
      .map((a) => {
        const href = resolveAppHref(a, isDev);

        return {
          id: a.id,
          label: a.label,
          iconUrl: a.iconUrl,
          url: href ?? '#',
          disabled: !href,
          devOnly: isDevOnly(a),
        };
      }),
  ];
}
