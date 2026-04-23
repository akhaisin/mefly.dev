export interface App {
  id: string;
  label: string;
  iconUrl: string;
  iframeUrl?: string;
  iframeUrlLocal?: string;
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
  return !app.iframeUrl && !!app.iframeUrlLocal;
}

export const apps: App[] = [
  {
    id: 'track-builder',
    label: 'Track Builder',
    iconUrl: 'https://akhaisin.github.io/fpv-track-builder/favicon.svg',
    // iframeUrl: 'https://akhaisin.github.io/fpv-track-builder/',
    iframeUrlLocal: 'http://localhost:5173/',
    urlSync: true,
  },
  {
    id: 'csrf-tester',
    label: 'CSRF Tester',
    iconUrl: 'https://akhaisin.github.io/csrf-tester/favicon.svg',
    // iframeUrl: 'https://akhaisin.github.io/csrf-tester/',
    iframeUrlLocal: 'http://localhost:5173/',
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
      .map((a) => ({
        id: a.id,
        label: a.label,
        iconUrl: a.iconUrl,
        url: `/apps/${a.id}`,
        disabled: isDev ? !a.iframeUrl && !a.iframeUrlLocal : !a.iframeUrl,
        devOnly: !a.iframeUrl && !!a.iframeUrlLocal,
      })),
  ];
}
