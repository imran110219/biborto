import { S3Client } from "@aws-sdk/client-s3";

type R2Config = {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
};

let cachedClient: S3Client | undefined;

function getR2Config(): R2Config {
  const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME } = process.env;
  if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_ACCESS_KEY || !R2_BUCKET_NAME) {
    throw new Error("R2 is not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, and R2_BUCKET_NAME.");
  }

  return {
    accountId: R2_ACCOUNT_ID,
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
    bucketName: R2_BUCKET_NAME,
  };
}

export function getR2BucketName(): string {
  return getR2Config().bucketName;
}

export function getR2Client(): S3Client {
  if (cachedClient) return cachedClient;
  const config = getR2Config();
  cachedClient = new S3Client({
    region: "auto",
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
  return cachedClient;
}

export function getR2PublicUrl(key: string): string {
  const configuredUrl = process.env.R2_PUBLIC_URL;
  if (!configuredUrl) {
    throw new Error("R2_PUBLIC_URL must be set to the public custom domain or development URL for the bucket.");
  }

  const base = new URL(configuredUrl);
  if (base.protocol !== "https:" && base.protocol !== "http:") {
    throw new Error("R2_PUBLIC_URL must use HTTP or HTTPS.");
  }

  const basePath = base.pathname.replace(/\/+$/, "");
  const encodedKey = key.split("/").map(encodeURIComponent).join("/");
  base.pathname = `${basePath}/${encodedKey}`;
  base.search = "";
  base.hash = "";
  return base.toString();
}
