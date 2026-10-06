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

Edit `.env` and set at least `DATABASE_URL`, `AUTH_SECRET`, and `APP_URL`.
Set `GA_MEASUREMENT_ID` and `GOOGLE_SITE_VERIFICATION` there when needed;
the running server reads both values at request time. Add Google OAuth, R2,
and Resend settings if those features are enabled. Keep `.env` private. Point
the server's TLS reverse proxy to `http://127.0.0.1:3000` (or the selected
`PORT`).

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

The app expects Postgres and does not run schema changes automatically at
startup. Provision the database and apply the SQL in `db/` using the existing
database setup instructions before serving traffic. Apply new files in
`db/migrations/` manually before deploying app changes that depend on them.
