// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const { themes } = require("prism-react-renderer");
const lightCodeTheme = themes.github;
const darkCodeTheme = themes.dracula;

/** @type {import('@docusaurus/types').Config} */
const config = {
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
    "/ai.js",
    { src: "https://data.timeplus.com/p.js", async: true },
    {
      // This script triggers page() on every page change. (URL Encoded)
      src: "data:,let%20prevUrl%20%3D%20undefined%3B%0AsetInterval%28%28%29%20%3D%3E%20%7B%0A%20%20const%20currUrl%20%3D%20window.location.href%3B%0A%20%20if%20%28currUrl%20%21%3D%3D%20prevUrl%29%20%7B%0A%20%20%20%20%2F%2F%20URL%20changed%0A%20%20%20%20prevUrl%20%3D%20currUrl%3B%0A%20%20%20%20if%20%28window.jitsu%29%20%7B%0A%20%20%20%20%20%20window.jitsu.page%28%29%0A%20%20%20%20%7D%0A%20%20%7D%0A%7D%2C%201000%29%3B",
    },
    {
      src: "https://unpkg.com/@tinybirdco/flock.js",
      async: true,
      "data-host": "https://api.us-east.aws.tinybird.co",
      "data-token":
        "p.eyJ1IjogIjY3Yzg5ZjE5LWMwMWUtNGFlMS1hMmY0LTdmMDgxZWQ2OWZiMiIsICJpZCI6ICJiZGRlNjY2YS1hYTQ0LTQ3ZjctOTVmZC01NGQzNzNjM2U0OGUiLCAiaG9zdCI6ICJ1cy1lYXN0LWF3cyJ9.rZNeUMnTM5ouxLqEGrgs4-2kOSOCJ61b8GIgLZR6J20",
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
        appId: "UCWO77T9MZ",
        apiKey: "57b8ba245e7467472b18e6cbf5cfd384",
        indexName: "public_docs",
      },
      navbar: {
        title: "Docs",
        style: "dark",
        hideOnScroll: true,
        logo: {
          alt: "Timeplus",
          src: "img/Option1_B.png",
          srcDark: "img/Option1_W.png",
          href: "https://timeplus.com",
        },
        items: [
          {
            type: "dropdown",
            label: "Products",
            position: "left",
            className: "navbar__link--active",
            items: [
              {
                href: "https://www.timeplus.com/cloud",
                label: "Timeplus Cloud",
              },
              {
                href: "https://www.timeplus.com/enterprise",
                label: "Timeplus Enterprise",
              },
              {
                href: "https://www.timeplus.com/proton",
                label: "Timeplus Core",
              },
            ],
          },
          {
            type: "dropdown",
            label: "Use Cases",
            position: "left",
            className: "navbar__link--active",
            items: [
              {
                href: "https://www.timeplus.com/fintech",
                label: "FinTech",
              },
              {
                href: "https://www.timeplus.com/ai",
                label: "AI",
              },
              {
                href: "https://www.timeplus.com/proton-vs-ksqldb",
                label: "Timeplus vs. ksqlDB",
              },
            ],
          },
          {
            href: "https://www.timeplus.com/pricing",
            position: "left",
            label: "Pricing",
            className: "navbar__link--active",
          },
          {
            href: "https://www.timeplus.com/blog",
            position: "left",
            label: "Blog",
            className: "navbar__link--active",
          },
          {
            type: "dropdown",
            label: "Company",
            position: "left",
            className: "navbar__link--active",
            items: [
              {
                href: "https://www.timeplus.com/team",
                label: "Our Team",
              },
              {
                href: "https://www.timeplus.com/media-kit",
                label: "Media Kit",
              },
              {
                href: "https://www.timeplus.com/resources",
                label: "Resources",
              },

              {
                href: "https://timeplus.com/slack",
                label: "Slack Community",
              },
            ],
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
                label: "COMPANY",
                href: "https://timeplus.com",
              },
              {
                label: "SHOWCASES",
                href: "https://docs.timeplus.com/showcases",
              },
              {
                label: "TIMEPLUS VS. KSQLDB​",
                href: "https://www.timeplus.com/timeplus-vs-ksqldb",
              },
              {
                label: "PRICING",
                href: "https://www.timeplus.com/pricing",
              },
              {
                label: "OPEN SOURCE",
                href: "https://github.com/timeplus-io/proton",
              },
              {
                label: "STATUS",
                href: "https://timeplus.statuspage.io",
              },
            ],
          },
          {
            title: " ",
            items: [
              {
                label: "BLOG",
                href: "https://timeplus.com/blog",
              },
              {
                label: "RESOURCES",
                href: "https://www.timeplus.com/resources",
              },
              {
                label: "ABOUT US",
                href: "https://www.timeplus.com/team",
              },
              {
                label: "PRIVACY POLICY",
                href: "https://www.timeplus.com/privacy-policy",
              },
              {
                label: "TERMS OF SERVICE",
                href: "https://www.timeplus.com/terms-of-service",
              },
              {
                label: "SLACK",
                href: "https://timeplus.com/slack",
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
        copyright: `Copyright © 2024 Timeplus, Inc.`,
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
        ],
      },
      colorMode: {
        defaultMode: "dark",
        disableSwitch: true,
      },
    }),
  i18n: {
    defaultLocale: "en",
    locales: ["en", "zh"],
    localeConfigs: {
      zh: {
        label: "中文",
        htmlLang: "zh-CN",
      },
    },
  },
};

module.exports = config;
