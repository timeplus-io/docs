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
      customProps: { tag: "Popular" },
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
            {
              type: "doc",
              id: "proton-kafka",
              customProps: { tag: "Popular" },
            },
            {
              type: "doc",
              id: "timeplus-external-stream",
            },
            {
              type: "doc",
              id: "pulsar-external-stream",
            },
          ],
        },
        {
          type: "category",
          label: "External Tables",
          items: [
            "proton-clickhouse-external-table",
            {
              type: "doc",
              id: "mysql-external-table",
              customProps: { tag: "New" },
            },
            {
              type: "doc",
              id: "pg-external-table",
              customProps: { tag: "New" },
            },
            {
              type: "doc",
              id: "s3-external",
              customProps: { tag: "New" },
            },
          ],
        },
        {
          type: "doc",
          id: "iceberg",
          customProps: { tag: "New" },
        },
        "proton-schema-registry",
        "proton-format-schema",
        {
          type: "doc",
          id: "redpanda-connect",
          customProps: { tag: "Enterprise" },
        },
        {
          label: "Dictionary",
          type: "link",
          href: "https://docs.timeplus.com/sql-create-dictionary",
          customProps: { tag: "Enterprise" },
        },
        {
          type: "category",
          label: "User Defined Functions",
          collapsed: false,
          link: {
            type: "doc",
            id: "udf",
          },
          items: [
            "sql-udf",
            "remote-udf",
            "js-udf",
            {
              type: "doc",
              id: "py-udf",
              customProps: { tag: "New" },
            },
          ],
        },
        {
          type: "category",
          label: "Web Console",
          customProps: { tag: "Enterprise" },
          items: [
            {
              type: "category",
              label: "Getting Data In",
              //collapsed: false,
              link: {
                type: "doc",
                id: "ingestion",
              },
              items: [
                "kafka-source",
                "confluent-cloud-source",
                {
                  type: "doc",
                  id: "ingest-api",
                  customProps: { tag: "Enterprise" },
                },
              ],
            },
            {
              type: "doc",
              id: "destination",
            },
            {
              type: "doc",
              label: "Data Visualization",
              id: "viz",
            },
            {
              type: "doc",
              id: "alert",
            },
          ],
        },
        {
          type: "doc",
          id: "idempotent",
          customProps: { tag: "Enterprise" },
        },
        {
          type: "doc",
          id: "tiered-storage",
          customProps: { tag: "Enterprise" },
        },
      ],
    },
    /*"timeplus-enterprise",*/
    {
      type: "category",
      label: "Deployment & Operations",
      items: [
        "install",
        // {
        //   type: "doc",
        //   id: "timeplus-cloud",
        //   customProps: { tag: "Enterprise" },
        // },
        {
          type: "category",
          //collapsed: false,
          label: "Timeplus Enterprise Self-hosted",
          link: {
            type: "doc",
            id: "timeplus-self-host",
          },
          items: [
            "singlenode_install",
            "cluster_install",
            {
              type: "doc",
              id: "k8s-helm",
              customProps: { tag: "Popular" },
            },
          ],
        },
        {
          type: "doc",
          id: "server_config",
        },
        "proton-ports",
        {
          type: "doc",
          id: "rbac",
          customProps: { tag: "Enterprise" },
        },
      ],
    },
    {
      type: "category",
      label: "Guides & Tutorials",
      items: [
        "understanding-watermark",
        "tutorial-sql-kafka",
        "tutorial-github",
        "marimo",
        "tutorial-sql-connect-kafka",
        "tutorial-sql-connect-ch",
        "tutorial-cdc-rpcn-pg-to-ch",
        {
          type: "category",
          label: "Streaming ETL",
          items: [
            "tutorial-sql-etl",
            "tutorial-sql-etl-kafka-to-ch",
            "tutorial-sql-etl-mysql-to-ch",
          ],
        },
        "tutorial-sql-join",
        "tutorial-python-udf",
        "sql-pattern-topn",
        "usecases",
        "tutorial-kv",
        "tutorial-sql-read-avro",
        "tutorial-testcontainers-java",
      ],
    },
    {
      type: "category",
      label: "Monitoring & Troubleshooting",
      items: [
        "troubleshooting",
        "system-stream-state-log",
        "system-stream-metric-log",
        "prometheus",
      ],
    },
    {
      type: "category",
      label: "Open Source",
      items: [
        "proton",
        "proton-architecture",
        "proton-create-stream",
        "proton-manage-stream",
        "proton-faq",
      ],
    },
    {
      type: "category",
      label: "Query & SQL Reference",
      customProps: { tag: "Popular" },
      items: [
        "query-syntax",
        "query-settings",
        "checkpoint-settings",
        "datatypes",
        {
          type: "category",
          label: "SQL Commands",
          customProps: { tag: "Popular" },
          link: {
            type: "generated-index",
            title: "SQL Commands",
            description: "Overview of the SQL commands supported by Timeplus.",
            slug: "/category/commands",
            keywords: ["guides"],
          },
          items: [
            {
              label: "SELECT",
              type: "link",
              href: "https://docs.timeplus.com/query-syntax",
            },
            "sql-alter-stream",
            "sql-alter-view",
            "sql-create-database",
            "sql-create-dictionary",
            "sql-create-disk",
            "sql-create-external-stream",
            "sql-create-external-table",
            "sql-create-format-schema",
            "sql-create-function",
            "sql-create-materialized-view",
            "sql-create-mutable-stream",
            "sql-create-random-stream",
            "sql-create-remote-function",
            "sql-create-stream",
            "sql-create-view",
            "sql-delete",
            "sql-drop-database",
            "sql-drop-dictionary",
            "sql-drop-external-table",
            "sql-drop-format-schema",
            "sql-drop-function",
            "sql-drop-stream",
            "sql-drop-view",
            "sql-optimize",
            "sql-rename-stream",
            "sql-show-create",
            "sql-show-databases",
            "sql-show-dictionaries",
            "sql-show-disks",
            "sql-show-format-schemas",
            "sql-show-functions",
            "sql-show-streams",
            "sql-system-pause",
            "sql-system-resume",
            "sql-truncate-stream",
            "sql-use",
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
            "functions_for_dict",
            "functions_for_streaming",
          ],
        },
        "grok",
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
      label: "Clients, APIs & SDKs",
      items: [
        "proton-client",
        {
          type: "doc",
          id: "timeplusd-client",
          customProps: { tag: "Enterprise" },
        },
        {
          type: "category",
          label: "timeplus (CLI)",
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
            "cli-migrate",
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
        "jdbc",
        {
          label: "ODBC Driver",
          type: "link",
          href: "https://github.com/timeplus-io/proton-odbc",
        },
        "timeplus-connect",
        // {
        //   label: "Python Driver",
        //   type: "link",
        //   href: "https://github.com/timeplus-io/proton-python-driver",
        // },
        {
          label: "Go Driver",
          type: "link",
          href: "https://github.com/timeplus-io/proton-go-driver",
        },
        {
          label: "C++ Client",
          type: "link",
          href: "https://github.com/timeplus-io/timeplus-cpp",
        },
        {
          label: "Rust Client",
          type: "link",
          href: "https://crates.io/crates/proton_client",
        },
        {
          label: "Timeplus REST API",
          type: "link",
          href: "https://docs.timeplus.com/rest",
        },
        "proton-ingest-api",
        {
          type: "doc",
          id: "query-api",
          customProps: { tag: "Enterprise" },
        },
      ],
    },
    {
      type: "category",
      label: "Third-party Tools",
      //collapsed: false,
      link: {
        type: "generated-index",
        title: "Third-party Tools",
        description: "Integrate Timeplus to your tool stacks.",
        slug: "/category/tools",
        keywords: ["guides"],
      },
      items: [
        {
          type: "doc",
          id: "integration-grafana",
          customProps: { tag: "Popular" },
        },
        "integration-metabase",
        "sling",
        "kafka-connect",
        {
          label: "Push data to Timeplus via Airbyte",
          type: "link",
          href: "https://airbyte.com/connectors/timeplus",
        },
        {
          label: "Push data to Timeplus via Meltano",
          type: "link",
          href: "https://www.timeplus.com/post/meltano-timeplus-target",
        },
        "flyway",
        "terraform",
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
        "enterprise-v2.8",
        "enterprise-v2.7",
        "enterprise-v2.6",
        "enterprise-v2.5",
        "enterprise-v2.4",
        "enterprise-v2.3",
        "v2-release-notes",
        "release-downloads",
        {
          type: "category",
          label: "Older Releases",
          items: [
            "v1-release-notes",
            "public-beta-2",
            "public-beta-1",
            "private-beta-2",
            "private-beta-1",
          ],
        },
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
