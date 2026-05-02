import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import type {PluginOptions} from 'docusaurus-plugin-search-local';

const config: Config = {
  markdown: {
    mermaid: true,
  },
  themes: ['@docusaurus/theme-mermaid'],
  title: 'Bittensor Co-Learning Camp',
  tagline: 'From zero to active miner on Bittensor. HackQuest × Bittensor, India.',

  url: 'https://bittensor-camp.hackquest.io',
  baseUrl: '/',

  organizationName: 'hackquest',
  projectName: 'bittensor-co-learning-camp',

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  plugins: [
    [
      'docusaurus-plugin-search-local',
      {
        hashed: true,
        highlightSearchTermsOnTargetPage: true,
        docsRouteBasePath: '/',
      } satisfies PluginOptions,
    ],
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          routeBasePath: '/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    colorMode: {
      defaultMode: 'light',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'Bittensor Co-Learning Camp',
      logo: {
        alt: 'Bittensor',
        src: 'img/bittensor/symbol-white.svg',
        srcDark: 'img/bittensor/symbol-white.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Curriculum',
        },
        {
          href: 'https://bittensor.com',
          label: 'Bittensor',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Curriculum',
          items: [
            {label: 'Overview', to: '/overview'},
            {label: 'Day 1 — Foundations', to: '/Day-1-Foundations/what-is-web3'},
            {label: 'Day 2 — Tooling & Ecosystem', to: '/Day-2-Tooling-and-Ecosystem/intro-and-hardware-check'},
            {label: 'Day 3 — Testnet & Registration', to: '/Day-3-Testnet-and-Registration/register-subnet-testnet'},
            {label: 'Day 4 — Mining & Optimization', to: '/Day-4-Mining-and-Optimization/local-debugging'},
            {label: 'Resources', to: '/resources'},
          ],
        },
        {
          title: 'Bittensor',
          items: [
            {label: 'bittensor.com', href: 'https://bittensor.com'},
            {label: 'Documentation', href: 'https://docs.bittensor.com'},
            {label: 'Taostats', href: 'https://taostats.io'},
            {label: 'Discord', href: 'https://discord.gg/bittensor'},
          ],
        },
        {
          title: 'Community',
          items: [
            {label: 'HackQuest', href: 'https://www.hackquest.io'},
            {label: 'X / Twitter', href: 'https://x.com/HackQuest_'},
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Bittensor Co-Learning Camp India · HackQuest × Bittensor.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'python', 'json', 'yaml', 'toml', 'rust'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
