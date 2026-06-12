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
      disableSwitch: true,
      respectPrefersColorScheme: false,
    },
    navbar: {
      title: 'Bittensor Co-Learning Camp',
      logo: {
        alt: 'Bittensor',
        src: 'img/bittensor/symbol-white.svg',
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
            {label: 'TH1 — Foundations', to: '/TH1-Foundations-and-Introduction/introduction-to-web3'},
            {label: 'TH2 — Tooling & Ecosystem', to: '/TH2-Tooling-and-Ecosystem/tao-tokenomics'},
            {label: 'TH3 — Core Subnets', to: '/TH3-Core-Subnets-and-Opportunities/what-are-subnets'},
            {label: 'TH4 — Wallets & Miner Setup', to: '/TH4-Wallets-and-Miner-Setup/installing-dependencies'},
            {label: 'TH5 — Running a Miner', to: '/TH5-Running-a-Miner/registering-a-miner'},
            {label: 'TH6 — Graduation & Showcase', to: '/TH6-Graduation-and-Showcase/submission-validation'},
            {label: 'One-Shot Guide', to: '/one-shot'},
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
      additionalLanguages: ['bash', 'python', 'json', 'yaml', 'toml', 'rust'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
