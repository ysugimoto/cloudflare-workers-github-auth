# cloudflare-worker-github-auth

Edge-side GitHub authentication example.

## Requirements

- node.js (v16.13.1 or later)

## Installation

Clone this repository and install dependent packages, and sign into Cloudflare.

```shell
git clone https://github.com/ysugimoto/cloudflare-workers-github-auth.git
cd cloudflare-workers-github-auth
yarn
yarn login
```

The `yarn login` calls `wrangler login`.

And make sure your GitHub OAuth app has been created.
Put GitHub app secrets to `wrangler.toml`:

```toml
[vars]
GITHUB_CLIENT_ID = "<your github client id>"
GITHUB_CLIENT_SECRET = "<your github client secret>"
GITHUB_REDIRECT_URI="http://localhost:8787/signin/callback"
```

Then, you can confirm this app behavior in your local environment.

```shell
yarn dev
```

You can see the application in `http://localhost:8787` via `miniflare`.

## Deployment

First, you need to create `wrangler.production.toml`. Example file exists:

```shell
cp wrangler.production.toml.example wrangler.production.toml
```

And need to modify settings in `wrangler.production.toml`:

```toml
kv_namespaces = [
  { binding = "SESSION", id = "find your KV id in dashboard" },
  { binding = "STATE", id = "find your KV id in dashboard" },
]

[vars]
GITHUB_CLIENT_ID="<your production github app client id>"
GITHUB_CLIENT_SECRET="<your production github app client secret>"
GITHUB_REDIRECT_URI="https://<your worker-route>/signin/callback"
```

And you need to create `Workers KV` via your Cloudflare dashboard like `https://dash.cloudflare.com/<your account id>/workers/kv/namespaces` and after create them, put KV namespace id for each `kv_namespaces` bindings.

Then, finally you can deploy workers in your account!

```shell
yarn deploy
```

## Author

Yoshiaki Sugimoto <sugimoto@wnotes.net>
