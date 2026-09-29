import type { DefaultSession } from "next-auth";
import type { PlatformRole } from "@/lib/types";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      platformRole: PlatformRole;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    platformRole?: PlatformRole;
  }
}
