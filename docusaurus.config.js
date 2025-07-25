// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const { themes } = require("prism-react-renderer");
const lightCodeTheme = themes.github;
const darkCodeTheme = themes.dracula;

/** @type {import('@docusaurus/types').Config} */
const config = {
  future: {
    v4: true,
  },
  title: "Timeplus",
  tagline: "Simple, powerful, cost-efficient stream processing",
  url: "https://docs.timeplus.com/",
  baseUrl: "/",
  onBrokenLinks: "warn", // SHOULD BE throw
  onBrokenAnchors: "warn",
  onBrokenMarkdownLinks: "warn",
  favicon: "img/favicon.ico",
  organizationName: "timeplus-io", // Usually your GitHub org/user name.
  projectName: "docs", // Usually your repo name.
  scripts: [
    "/hotjar.js",
    // "/ai.js",
    { src: "https://data.timeplus.com/p.js", async: true },
    {
      // This script triggers page() on every page change. (URL Encoded)
      src: "data:,let%20prevUrl%20%3D%20undefined%3B%0AsetInterval%28%28%29%20%3D%3E%20%7B%0A%20%20const%20currUrl%20%3D%20window.location.href%3B%0A%20%20if%20%28currUrl%20%21%3D%3D%20prevUrl%29%20%7B%0A%20%20%20%20%2F%2F%20URL%20changed%0A%20%20%20%20prevUrl%20%3D%20currUrl%3B%0A%20%20%20%20if%20%28window.jitsu%29%20%7B%0A%20%20%20%20%20%20window.jitsu.page%28%29%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D%2C%201000%29%3B",
    },
    "/koala.js",
  ],
  plugins: ["docusaurus-plugin-hubspot"],

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      {
        gtag: {
          trackingID: "G-8HHYCJFNRD",
          anonymizeIP: false,
        },
        googleTagManager: {
          containerId: "GTM-5XLMK2H9",
        },
        docs: {
          path: "docs",
          routeBasePath: "/", // Serve the docs at the site's root
          remarkPlugins: [require("mdx-mermaid")],
          sidebarPath: require.resolve("./sidebars.js"),
          showLastUpdateAuthor: true,
          showLastUpdateTime: true,
          // Please change this to your repo.
          //editUrl: 'https://github.com/timeplus-io/docs/blob/main',
        },
        blog: false,
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      },
    ],
  ],

  markdown: {
    mermaid: true,
  },
  themes: ["@docusaurus/theme-mermaid"],
  clientModules: [require.resolve("./src/scripts/mermaid_icons.js")],

  themeConfig:
    /** @type
     * {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      hubspot: {
        accountId: 23123537,
      },
      mermaid: {
        theme: { light: "neutral", dark: "dark" },
      },
      docs: {
        sidebar: {
          hideable: true,
          autoCollapseCategories: true,
        },
      },
      tableOfContents: {
        minHeadingLevel: 2,
        maxHeadingLevel: 6,
      },
      algolia: {
        appId: "9IV0P6OE4K",
        apiKey: "ed69e90cdcb54d99af90c95574b6fc4a",
        indexName: "docs.timeplus.cm",
        askAi: "HoTc2tNwsghX",
      },
      navbar: {
        title: "Docs",
        style: "dark",
        hideOnScroll: true,
        logo: {
          alt: "Timeplus",
          src: "img/Option1_B.png",
          srcDark: "img/Option1_W.png",
          href: "/",
        },
        items: [
          // {
          //   type: "doc",
          //   position: "left",
          //   docId: "quickstart",
          //   label: "Quickstart",
          // },
          {
            href: "https://demos.timeplus.com",
            position: "left",
            label: "Demos",
            className: "navbar__link--active",
          },
          {
            href: "https://www.timeplus.com/download",
            position: "left",
            label: "Download",
            className: "navbar__link--active",
          },
          {
            type: "doc",
            position: "left",
            docId: "ingestion",
            label: "Get Data In",
          },
          {
            type: "doc",
            position: "left",
            docId: "query-syntax",
            label: "Query Data",
          },
          {
            type: "doc",
            position: "left",
            docId: "destination",
            label: "Send Data Out",
          },
          {
            href: "https://www.timeplus.com",
            position: "left",
            label: "Company",
            className: "navbar__link--active",
          },
          {
            href: "https://www.timeplus.com/blog",
            position: "left",
            label: "Blog",
            className: "navbar__link--active",
          },
          {
            type: "search",
            position: "right",
          },
          {
            href: "https://timeplus.com/slack",
            label: " ",
            position: "right",
            className: "header-slack-link",
            "aria-label": "Slack community",
          },
          {
            href: "https://github.com/timeplus-io/proton",
            label: " ",
            position: "right",
            className: "header-github-link",
            "aria-label": "GitHub repository",
          },
          // {
          //   type: 'localeDropdown',
          //   position: 'right',
          // },
        ],
      },
      footer: {
        style: "dark",
        links: [
          {
            title: " ",
            items: [
              {
                label: "Docs",
                href: "https://docs.timeplus.com",
              },
              {
                label: "Product",
                href: "https://www.timeplus.com/product",
              },
              {
                label: "Pricing",
                href: "https://www.timeplus.com/pricing",
              },
              {
                label: "Open Source",
                href: "https://github.com/timeplus-io/proton",
              },
              {
                label: "Demos",
                href: "https://demos.timeplus.com",
              },
            ],
          },
          {
            title: " ",
            items: [
              {
                label: "Blog",
                href: "https://timeplus.com/blog",
              },
              {
                label: "About Us",
                href: "https://www.timeplus.com/our-team",
              },
              {
                label: "Privacy Policy",
                href: "https://www.timeplus.com/privacy-policy",
              },
              {
                label: "Terms of Service",
                href: "https://www.timeplus.com/terms-of-service",
              },
              {
                label: "EUSA",
                href: "https://www.timeplus.com/eusa",
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
        copyright: `Copyright © 2025 Timeplus, Inc.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
        additionalLanguages: [
          "bash",
          "hcl",
          "java",
          "javascript",
          "json",
          "python",
          "protobuf",
          "sql",
          "yaml",
        ],
      },
      colorMode: {
        defaultMode: "dark",
        disableSwitch: true,
      },
    }),
  i18n: {
    defaultLocale: "en",
    locales: ["en"], //["en", "zh"],
    // localeConfigs: {
    //   zh: {
    //     label: "中文",
    //     htmlLang: "zh-CN",
    //   },
    // },
  },
};

module.exports = config;
