// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Timeplus',
  tagline: 'Fast + Powerful Real-time Analytics Made Intuitive',
  url: 'https://docs.timeplus.com/',
  baseUrl: '/',
  onBrokenLinks: 'warn', // SHOULD BE throw
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'timeplus-io', // Usually your GitHub org/user name.
  projectName: 'docs', // Usually your repo name.
  scripts:['/heap.js','/hotjar.js','/ai.js','https://data.timeplus.com/p.js'],
  plugins: ['docusaurus-plugin-hubspot'],

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          path: 'docs',
          routeBasePath: '/', // Serve the docs at the site's root
          remarkPlugins: [require('mdx-mermaid')],
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          //editUrl: 'https://github.com/timeplus-io/docs/blob/main',
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  markdown: {
    mermaid: true,
  },
  themes: ['@docusaurus/theme-mermaid'],

  themeConfig:
    /** @type 
     * {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      hubspot: {
        accountId: 23123537,
      },
      mermaid:{
        theme: {light: 'neutral', dark: 'dark'},
      },
      docs:{
        sidebar:{
          hideable: true,
          autoCollapseCategories: true,
        }
      },
      tableOfContents: {
        minHeadingLevel: 2,
        maxHeadingLevel: 6,
      },
      algolia: {
        appId:'UCWO77T9MZ',
        apiKey:'57b8ba245e7467472b18e6cbf5cfd384',
        indexName:'public_docs',
      },
      navbar: {
        title: 'Docs',
        hideOnScroll: true,
        logo: {
          alt: 'Timeplus',
          src: 'img/Option1_B.png',
          srcDark: 'img/Option1_W.png',
        },
        items: [
          {
            type: 'doc',
            docId: 'index',
            position: 'left',
            label: 'Overview',
          },
          {
            type: 'doc',
            docId: 'quickstart',
            position: 'left',
            label: 'Quickstart',
          },
          {
            type: 'doc',
            docId: 'functions',
            position: 'left',
            label: 'Functions',
          },
          {
            type: 'doc',
            docId: 'changelog',
            position: 'left',
            label: "What's New",
          },
          {
            href: 'https://docs.timeplus.com/rest.html',
            position: 'left',
            label: 'REST API',
          },
          /*
          {
            href: 'https://github.com/timeplus-io/',
            label: 'GitHub',
            position: 'right',
          },
          */
          {
            type: 'search',
            position: 'right',
          },
          {
            href: 'https://timeplus.com/slack',
            label: ' ',
            position: 'right',
            className: 'header-slack-link',
            'aria-label': 'Slack community',
          },
          // {
          //   type: 'localeDropdown',
          //   position: 'right',
          // },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Company',
            items: [
              {
                label: 'Company Home Page',
                href: 'https://timeplus.com',
              },
              {
                label: 'Timeplus Cloud',
                href: 'https://us.timeplus.cloud',
              },
              {
                label: 'Live Demo',
                href: 'https://demo.timeplus.cloud',
              },
              {
                label: 'Blog',
                href: 'https://timeplus.com/blog',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'Community Slack',
                href: 'https://timeplus.com/slack',
              },
              {
                label: 'Github',
                href: 'https://github.com/timeplus-io/',
              },
            ],
          },
          /*
          {
            title: 'More',
            items: [
              {
                label: 'Blog',
                to: '/blog',
              },
              {
                label: 'GitHub',
                href: 'https://github.com/timeplus-io',
              },
            ],
          },*/
        ],
        copyright: `Copyright © 2023 Timeplus, Inc.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
        additionalLanguages: ['java','json'],
      },
      colorMode:{
        defaultMode:'dark',
        disableSwitch: true,
      },
    }),
  i18n: {
      defaultLocale: 'en',
      locales: ['en', 'zh'],
      localeConfigs: {
        zh: {
          label: '中文',
          htmlLang: 'zh-CN',
        }
      },
    },  
};

module.exports = config;
