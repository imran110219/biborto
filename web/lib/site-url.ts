// The site's public origin (https://example.org). Behind a reverse proxy that doesn't forward the
// public host, the request's own URL says "localhost:3000" or the container's address, so anything
// that builds an absolute URL for the browser — Auth.js redirects after sign-in/sign-out, the
// proxy's redirects, origin checks — must start from configuration instead: APP_URL (or AUTH_URL).

const parseOrigin = (value: string | undefined) => {
  try {
    return value ? new URL(value).origin : undefined;
  } catch {
    return undefined;
  }
};

/** The configured public origin, if any (AUTH_URL wins over APP_URL). */
export function configuredOrigin(env: Record<string, string | undefined> = process.env): string | undefined {
  return parseOrigin(env.AUTH_URL ?? env.NEXTAUTH_URL) ?? parseOrigin(env.APP_URL);
}

/** The origin to use in redirects: the configured one, else the request's own. */
export function publicOrigin(requestOrigin: string, env: Record<string, string | undefined> = process.env): string {
  return configuredOrigin(env) ?? requestOrigin;
}
