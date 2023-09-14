# Website

This website is built using [Docusaurus 2](https://docusaurus.io/), a modern static website generator.

### Installation

```
$ yarn
```

### Local Development

```
$ yarn start
```

This command starts a local development server and opens up a browser window. Most changes are reflected live without having to restart the server.

### Build

```
$ yarn build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

### Deployment

Using SSH:

```
$ USE_SSH=true yarn deploy
```

Not using SSH:

```
$ GIT_USER=<Your GitHub username> yarn deploy
```

If you are using GitHub pages for hosting, this command is a convenient way to build the website and push to the `gh-pages` branch.

### Update Neutron REST API doc

1. Make sure your Neutron is up-to-date
2. Go to your Neutron folder, `make gen_api_doc` to generate `docs/swagger.yaml`
3. Go back to this folder and modify the `root` inside the `.redocly.yaml`, make sure the path is correct
4. `yarn rest-doc`
