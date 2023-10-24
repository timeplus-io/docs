# Timeplus Documentation

This website is built using [Docusaurus 2](https://docusaurus.io/), a modern static website generator. 

### Installation

If you are new to Docusaurus/NodeJS, please install yarn, nvm and node first. Example:

```shell
brew install yarn
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
#start a new terminal window
nvm install node
```

Then run `yarn` to install the dependency libs.

### Local Development

```
yarn start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

### Build

```
yarn build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

### Deployment

It has been configured to deploy new changes to docs.timeplus.com via Netlify.

### Localization
Currently English is the only official language for the documentation and we are working on other languages, starting from Simplified Chinese.
[![Crowdin](https://badges.crowdin.net/timeplus-docs/localized.svg)](https://crowdin.com/project/timeplus-docs) It's managed by Crowdin and welcome any contribution.

### Update Neutron REST API doc

1. Make sure your Neutron is up-to-date
2. Go to your Neutron folder, `make gen_api_doc` to generate `docs/swagger.yaml`
3. Go back to this folder and modify the `root` inside the `.redocly.yaml`, make sure the path is correct
4. `yarn rest-doc`
