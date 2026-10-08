import type { DefaultSession } from "next-auth";
import type { PlatformRole } from "@/lib/types";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      platformRole: PlatformRole;
      memberId?: string;
      /** False until the member has confirmed their details at /welcome. */
      profileCompleted: boolean;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    platformRole?: PlatformRole;
    memberId?: string;
    profileCompleted?: boolean;
  }
}
