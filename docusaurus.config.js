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
          href: "https://docs.timeplus.com",
        },
        items: [
          {
            type: "dropdown",
            label: "Product",
            position: "left",
            className: "navbar__link--active",
            items: [
              {
                href: "https://www.timeplus.com/product",
                label: "Timeplus Enterprise",
                className: "navbar__link--active",
              },
              {
                href: "https://www.timeplus.com/pricing",
                label: "Pricing",
                className: "navbar__link--active",
              },
              {
                type: "html",
                value:
                  "<span style='font-size: 14px;color: #AEACB0;'>WHY TIMEPLUS?</span>",
              },
              {
                href: "https://www.timeplus.com/timeplus-vs-ksqldb",
                label: "Timeplus vs. ksqlDB",
                className: "navbar__link--active",
              },
              {
                href: "https://www.timeplus.com/timeplus-vs-flink",
                label: "Timeplus vs. Apache Flink",
                className: "navbar__link--active",
              },
              {
                href: "https://www.timeplus.com/timeplus-and-clickhouse",
                label: "Timeplus + ClickHouse",
                className: "navbar__link--active",
              },
            ],
          },
          {
            type: "dropdown",
            label: "Solutions",
            position: "left",
            className: "navbar__link--active",
            items: [
              {
                type: "html",
                value:
                  "<span style='font-size: 14px;color: #AEACB0;'>BY USE CASE</span>",
              },
              {
                href: "https://www.timeplus.com/real-time-trade-intelligence",
                label: "Real-Time Trade Intelligence",
              },
              {
                href: "https://www.timeplus.com/ddos-detection",
                label: "DDoS Detection",
              },
              {
                href: "https://www.timeplus.com/anomaly-detection",
                label: "Edge Analytics and Anomaly Detection",
              },
              {
                href: "https://www.timeplus.com/observability",
                label: "Observability",
              },
              {
                href: "https://www.timeplus.com/real-time-feature-platform",
                label: "AI/ML: Real-Time Feature Platform",
              },
              {
                href: "https://www.timeplus.com/real-time-rag",
                label: "AI/ML: Real-Time RAG",
              },
              {
                type: "html",
                value:
                  "<span style='font-size: 14px;color: #AEACB0;'>BY INDUSTRY</span>",
              },
              {
                href: "https://www.timeplus.com/financial-services",
                label: "Financial Services",
              },
              {
                href: "https://www.timeplus.com/telecommunications",
                label: "Telecommunications",
              },
              {
                href: "https://www.timeplus.com/manufacturing",
                label: "Manufacturing",
              },
              {
                href: "https://www.timeplus.com/technology-industry",
                label: "Technology",
              },
            ],
          },
          {
            type: "dropdown",
            label: "About Us",
            position: "left",
            className: "navbar__link--active",
            items: [
              {
                href: "https://www.timeplus.com/our-team",
                label: "Our Team",
                className: "navbar__link--active",
              },
              {
                href: "https://www.timeplus.com/media-kit",
                label: "Media Kit",
                className: "navbar__link--active",
              },
            ],
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
                label: "Pricing​",
                href: "https://www.timeplus.com/pricing",
              },
              {
                label: "Open Source",
                href: "https://github.com/timeplus-io/proton",
              },
              {
                label: "Status",
                href: "https://timeplus.statuspage.io",
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
