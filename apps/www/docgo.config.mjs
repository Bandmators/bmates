import { defineConfig } from '@kyechan99/docgo';

const github = 'https://github.com/Bandmators/bmates';

const englishSidebar = [
  {
    text: 'Overview',
    items: [
      { text: 'Getting Started', link: '/docs/getting-started' },
      { text: 'Configuration', link: '/docs/configuration' },
      { text: 'Architecture and Core', link: '/docs/core' },
      { text: 'Lifecycle and cleanup', link: '/docs/guides/lifecycle' },
      { text: 'Editing interactions', link: '/docs/guides/interactions' },
      { text: 'Export audio and project data', link: '/docs/guides/export' },
      { text: 'Live Demo', link: '/docs/demo' },
    ],
  },
  {
    text: 'React Studio',
    items: [
      { text: 'BMates', link: '/docs/bmates' },
      { text: 'useBMates', link: '/docs/usebmates' },
    ],
  },
  {
    text: 'Editor API',
    collapsed: false,
    items: [
      { text: 'Editor', link: '/docs/editor/editor' },
      { text: 'AudioPlayer', link: '/docs/editor/audioplayer' },
      { text: 'Event', link: '/docs/editor/event' },
      { text: 'Playhead', link: '/docs/editor/playhead' },
      { text: 'TimeIndicator', link: '/docs/editor/timeindicator' },
      { text: 'Timeline', link: '/docs/editor/timeline' },
      { text: 'Track', link: '/docs/editor/track' },
      { text: 'TrackGroup', link: '/docs/editor/trackgroup' },
      { text: 'Wave', link: '/docs/editor/wave' },
      { text: 'Workground', link: '/docs/editor/workground' },
    ],
  },
  {
    text: 'Renderer API',
    collapsed: true,
    items: [
      { text: 'Container', link: '/docs/renderer/container' },
      { text: 'Layer', link: '/docs/renderer/layer' },
      { text: 'Node', link: '/docs/renderer/node' },
      { text: 'Stage', link: '/docs/renderer/stage' },
    ],
  },
];

const koreanSidebar = [
  {
    text: '\uc2dc\uc791\ud558\uae30',
    items: [
      { text: '\uc124\uce58 \ubc0f \uc2dc\uc791', link: '/docs/getting-started' },
      { text: '\uc124\uc815', link: '/docs/configuration' },
      { text: '\uc544\ud0a4\ud14d\ucc98\uc640 Core', link: '/docs/core' },
      { text: '\uc218\uba85\uc8fc\uae30\uc640 \uc815\ub9ac', link: '/docs/guides/lifecycle' },
      { text: '\ud3b8\uc9d1 \uc0c1\ud638\uc791\uc6a9', link: '/docs/guides/interactions' },
      {
        text: '\uc624\ub514\uc624\uc640 \ud504\ub85c\uc81d\ud2b8 \ub0b4\ubcf4\ub0b4\uae30',
        link: '/docs/guides/export',
      },
      { text: '\ub77c\uc774\ube0c \ub370\ubaa8', link: '/docs/demo' },
    ],
  },
  {
    text: 'React Studio',
    items: [
      { text: 'BMates \ucef4\ud3ec\ub10c\ud2b8', link: '/docs/bmates' },
      { text: 'useBMates', link: '/docs/usebmates' },
    ],
  },
  {
    text: 'Editor API',
    collapsed: false,
    items: [
      { text: 'Editor', link: '/docs/editor/editor' },
      { text: 'AudioPlayer', link: '/docs/editor/audioplayer' },
      { text: 'Event', link: '/docs/editor/event' },
      { text: 'Playhead', link: '/docs/editor/playhead' },
      { text: 'TimeIndicator', link: '/docs/editor/timeindicator' },
      { text: 'Timeline', link: '/docs/editor/timeline' },
      { text: 'Track', link: '/docs/editor/track' },
      { text: 'TrackGroup', link: '/docs/editor/trackgroup' },
      { text: 'Wave', link: '/docs/editor/wave' },
      { text: 'Workground', link: '/docs/editor/workground' },
    ],
  },
  {
    text: 'Renderer API',
    collapsed: true,
    items: [
      { text: 'Container', link: '/docs/renderer/container' },
      { text: 'Layer', link: '/docs/renderer/layer' },
      { text: 'Node', link: '/docs/renderer/node' },
      { text: 'Stage', link: '/docs/renderer/stage' },
    ],
  },
];

export default defineConfig({
  title: 'BMates',
  siteTitle: 'BMates',
  description: 'Open-source, embeddable multitrack audio editor for the web.',
  docsDir: 'posts',
  outDir: 'out',
  baseUrl: '/bmates/',
  siteUrl: 'https://bandmators.github.io/bmates/',
  clientPreviews: { editor: { module: './posts/previews/editor.preview.tsx' } },
  head: [['link', { rel: 'stylesheet', href: '/bmates/bmates-home.css' }]],
  logo: { src: '/favicon.ico', alt: 'BMates' },
  nav: [
    { text: 'Guide', link: '/docs/getting-started' },
    { text: 'Live demo', link: '/#live-demo' },
  ],
  i18n: {
    defaultLocale: 'en',
    locales: [
      { code: 'en', label: 'English' },
      {
        code: 'ko',
        label: '\ud55c\uad6d\uc5b4',
        nav: [
          { text: '\uac00\uc774\ub4dc', link: '/docs/getting-started' },
          { text: '\ub77c\uc774\ube0c \ub370\ubaa8', link: '/#live-demo' },
        ],
        sidebar: { '/docs/': koreanSidebar },
        footer: {
          message:
            '\uc6f9\uc744 \uc704\ud55c \uc624\ud508 \uc18c\uc2a4 \uba40\ud2f0\ud2b8\ub799 \uc624\ub514\uc624 \ud3b8\uc9d1\uae30.',
          copyright: 'MIT License\ub85c \ubc30\ud3ec\ub429\ub2c8\ub2e4.',
        },
      },
    ],
  },
  sidebar: { '/docs/': englishSidebar },
  socialLinks: [{ icon: 'github', link: github }],
  editLink: { pattern: `${github}/edit/main/apps/www/posts/:path`, text: 'Edit this page on GitHub' },
  lastUpdated: false,
  outline: 'deep',
  footer: {
    message: 'Open-source multitrack audio editing for the web.',
    copyright: 'Released under the MIT License.',
  },
  docFooter: { prev: 'Previous', next: 'Next' },
  search: true,
  docs: { menuTitle: 'BMates Docs', tocTitle: 'On this page', tocProgress: true },
  seo: {
    favicon: { href: '/favicon.ico' },
    image: '/bmates_thumbnail.png',
    jsonLd: true,
    sitemap: { changefreq: 'weekly', priority: 0.8 },
    robots: true,
    llmsTxt: {
      title: 'BMates Documentation',
      description: 'Guides and API references for the BMates web audio editor.',
    },
  },
});
