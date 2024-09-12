/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */

// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  // By default, Docusaurus generates a sidebar from the docs folder structure
  //tutorialSidebar: [{type: 'autogenerated', dirName: '.'}],

  // But you can create a sidebar manually
  /*
  tutorialSidebar: [
    {
      type: 'category',
      label: 'Tutorial',
      items: ['hello'],
    },
  ],
   */
  docSidebar: [
    {
      type: "category",
      label: "Introduction",
      //collapsed: false,
      link: {
        type: "doc",
        id: "index",
      },
      items: [
        {
          type: "doc",
          id: "why-timeplus",
          customProps: { tag: "Popular" },
        },
        "showcases",
      ],
    },
    {
      type: "category",
      label: "Quickstart",
      items: ["quickstart", "proton-howto"],
    },
    {
      type: "category",
      label: "Key Features",
      items: [
        "stream-query",
        "history",
        "joins",
        "proton-create-view",
        {
          type: "doc",
          id: "mutable-stream",
          customProps: { tag: "Enterprise" },
        },
        {
          type: "category",
          label: "External Streams",
          collapsed: false,
          link: {
            type: "doc",
            id: "external-stream",
          },
          items: [
            "proton-kafka",
            {
              type: "doc",
              id: "timeplus-external-stream",
              customProps: { tag: "Enterprise" },
            },
          ],
        },
        "proton-schema-registry",
        "proton-format-schema",
        "proton-clickhouse-external-table",
        {
          type: "category",
          label: "User Defined Functions",
          collapsed: false,
          link: {
            type: "doc",
            id: "udf",
          },
          items: ["remote-udf", "js-udf"],
        },
        {
          type: "doc",
          id: "rbac",
          customProps: { tag: "Enterprise" },
        },
        {
          type: "doc",
          label: "Data Visualization",
          id: "viz",
          customProps: { tag: "Enterprise" },
        },
        {
          type: "doc",
          id: "destination",
          customProps: { tag: "Enterprise" },
        },
        {
          type: "doc",
          id: "alert",
          customProps: { tag: "Enterprise" },
        },
        {
          type: "doc",
          id: "query-api",
          customProps: { tag: "Enterprise" },
        },
        {
          type: "doc",
          id: "apikey",
          customProps: { tag: "Enterprise" },
        },
        {
          label: "REST API Reference",
          type: "link",
          href: "https://docs.timeplus.com/rest.html",
        },
        {
          type: "category",
          label: "CLI Reference",
          customProps: { tag: "Enterprise" },
          link: {
            type: "doc",
            id: "cli-reference",
          },
          items: [
            "cli-backup",
            "cli-diag",
            "cli-help",
            "cli-license",
            "cli-restart",
            "cli-restore",
            "cli-service",
            "cli-start",
            "cli-status",
            "cli-stop",
            "cli-sync",
            "cli-user",
            "cli-version",
          ],
        },
      ],
    },
    /*"timeplus-enterprise",*/
    {
      type: "category",
      label: "Deployment & Operations",
      items: [
        "install",
        {
          type: "doc",
          id: "timeplus-cloud",
          customProps: { tag: "Enterprise" },
        },
        {
          type: "category",
          //collapsed: false,
          label: "Timeplus Enterprise Self-hosted",
          link: {
            type: "doc",
            id: "timeplus-self-host",
          },
          items: ["singlenode_install", "cluster_install", "k8s-helm"],
        },
        {
          type: "doc",
          id: "server_config",
          customProps: { tag: "Enterprise" },
        },
        "proton-ports",
        {
          type: "doc",
          id: "terraform",
          customProps: { tag: "Enterprise" },
        },
      ],
    },
    {
      type: "category",
      label: "Guides & Tutorials",
      items: [
        {
          type: "category",
          label: "Data Collection",
          //collapsed: false,
          link: {
            type: "doc",
            id: "ingestion",
          },
          items: [
            "kafka-source",
            "confluent-cloud-source",
            "pulsar-source",
            "ingest-api",
            /*"automq-kafka-source",*/
          ],
        },
        "quickstart-confluent",
        "quickstart-ingest-api",
        "tutorial-github",
        "tutorial-sql-connect-kafka",
        "tutorial-sql-kafka",
        "tutorial-sql-join",
        "tutorial-sql-etl",
        "tutorial-sql-etl-kafka-to-ch",
        "tutorial-sql-etl-mysql-to-ch",
        "tutorial-sql-read-avro",
        "tutorial-sql-connect-ch",
        "tutorial-kv",
        "sql-pattern-topn",
        "usecases",
      ],
    },
    {
      type: "category",
      label: "Timeplus Proton",
      link: {
        type: "doc",
        id: "proton",
      },
      items: [
        "proton-architecture",
        "proton-create-stream",
        "proton-manage-stream",
        "proton-ingest-api",
        "proton-faq",
      ],
    },
    {
      type: "category",
      label: "Query & SQL Reference",
      items: [
        "query-syntax",
        "query-settings",
        "datatypes",
        {
          type: "category",
          label: "SQL Commands",
          items: [
            "sql-create-stream",
            "sql-create-random-stream",
            "sql-create-external-stream",
            {
              type: "doc",
              id: "sql-create-mutable-stream",
              customProps: { tag: "Enterprise" },
            },
            "sql-alter-stream",
            "sql-show-streams",
            "sql-drop-stream",
            "sql-create-format-schema",
            "sql-show-format-schemas",
            "sql-drop-format-schema",

            "sql-create-view",
            "sql-create-materialized-view",
            "sql-alter-view",
            "sql-drop-view",
            "sql-create-external-table",
            "sql-create-function",
            "sql-show-functions",
            "sql-drop-function",
            "sql-show-create",

            "sql-system-pause",
            "sql-system-unpause",
            // "sql-system-abort",
            // "sql-system-recover",
          ],
        },
        {
          type: "category",
          label: "Built-in Functions",
          collapsed: true,
          link: { type: "doc", id: "functions" },
          items: [
            "functions_for_type",
            "functions_for_comp",
            "functions_for_datetime",
            "functions_for_url",
            "functions_for_json",
            "functions_for_text",
            "functions_for_hash",
            "functions_for_random",
            "functions_for_agg",
            "functions_for_logic",
            "functions_for_math",
            "functions_for_fin",
            "functions_for_geo",
            "functions_for_streaming",
          ],
        },
      ],
    },
    {
      type: "category",
      label: "Concepts",
      //collapsed: false,
      link: {
        type: "doc",
        id: "glossary",
      },
      items: [
        {
          type: "category",
          label: "Stream",
          //collapsed: false,
          link: {
            type: "doc",
            id: "working-with-streams",
          },
          items: ["changelog-stream", "versioned-stream", "substream"],
        },
        "eventtime",
        "view",
      ],
    },
    {
      type: "category",
      label: "Third-party Tools",
      //collapsed: false,
      link: {
        type: "doc",
        id: "glossary",
      },
      items: [
        "jdbc",
        "integration-grafana",
        "integration-metabase",
        "sling",
        "kafka-connect",
        "datapm",
      ],
    },
    /*"faq" */
    {
      type: "category",
      label: "Release Notes",
      //collapsed: false,
      link: {
        type: "doc",
        id: "release-notes",
      },
      items: [
        "v2-release-notes",
        "enterprise-releases",
        "enterprise-v2.3",
        "v1-release-notes",
        "public-beta-2",
        "public-beta-1",
        "private-beta-2",
        "private-beta-1",
      ],
    },
    {
      type: "category",
      label: "Additional Resources",
      items: ["getting-help", "credits"],
    },
  ],
};

module.exports = sidebars;
