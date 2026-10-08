# Manual server deployment

CI builds the Docker image and publishes `docker.io/DOCKERHUB_USERNAME/biborto`
after every push to `main`. Pull request builds check that the image builds
without publishing it. Production deployment stays manual.

In GitHub repository settings, add the Actions secrets `DOCKERHUB_USERNAME`
and `DOCKERHUB_TOKEN`. The token needs permission to push to the Docker Hub
repository `biborto` under that account or organization. Replace
`DOCKERHUB_USERNAME` in the server `.env` image value with the same namespace.

## One-time server setup

Copy this `server/` directory to the server and ensure Docker Engine with the
Docker Compose plugin is installed. Create the runtime configuration:

```sh
cp .env.example .env
```

Edit `.env` and set at least `DATABASE_URL`, `AUTH_SECRET`, `APP_URL` and `SUPERADMIN_PASSWORD`
(8+ characters; put it in double quotes if it contains `#`). `SUPERADMIN_EMAIL` is optional
(default `superadmin@biborto11.com`).
Set `GA_MEASUREMENT_ID` and `GOOGLE_SITE_VERIFICATION` there when needed;
the running server reads both values at request time. Add Google OAuth, R2,
and Resend settings if those features are enabled. Keep `.env` private. Point
the server's TLS reverse proxy to `http://127.0.0.1:3000` (or the selected
`PORT`). The reverse proxy must **overwrite** (not append to) the `X-Forwarded-For`
header with the real client address — sign-in and form rate limiting key on its
first entry, so a client-supplied value would let an attacker dodge the limits.
Serve the site over HTTPS and set `APP_URL` to the `https://` origin: that turns on
HSTS and `upgrade-insecure-requests` in the security headers.

For a private Docker Hub repository, log in once on the server with a Docker
Hub access token that can pull images:

```sh
echo "$DOCKERHUB_TOKEN" | docker login -u YOUR_DOCKERHUB_USERNAME --password-stdin
```

If the Docker Hub repository is public, this login step is unnecessary.

## Manual deploy

After CI finishes publishing the `main` image, run this from the copied
`server/` directory:

```sh
./deploy.sh
```

The script pulls the configured image, replaces the running app container,
and prints its status. Inspect logs with `docker compose logs -f web`.

To roll back, set `IMAGE` in `.env` to a previously published immutable tag,
such as `docker.io/YOUR_DOCKERHUB_USERNAME/biborto:sha-<commit>`, then run
`./deploy.sh` again.

## Database setup

The app expects Postgres and does not run schema changes automatically at startup.

**First deployment** — provision an empty Postgres database, put its `DATABASE_URL` (reachable from
inside the app container) and `SUPERADMIN_PASSWORD` in `server/.env`, then run once:

```sh
./init-db.sh      # schema + core data + superadmin, in one transaction
./deploy.sh       # start the app
```

`init-db.sh` runs inside the app image (which carries the SQL), so the server needs only Docker — no
`psql`, no Node, no copy of the repo's `db/` folder. It loads the 241-member roster, disciplines,
countries, default settings and the bootstrap superadmin, but **not** the sample content the
development seed adds. It refuses to run if the database already has the schema, and any failure rolls
back, so it is safe to retry after fixing the cause. Then sign in as the superadmin and fill in Settings.
Once it has succeeded you can remove `SUPERADMIN_PASSWORD` from `.env`: the running app never needs it.

**Later releases** — `./deploy.sh` alone is enough unless the release changes the schema.
`db/migrations/` is empty until the first production deploy; from then on it holds numbered files to apply
by hand, in order, before deploying app changes that depend on them (see `db/migrations/README.md`).
