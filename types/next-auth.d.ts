import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      account: string;
      type: string;
    };
  }

  interface User {
    account: string;
    type: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    u_id: string;
    u_account: string;
    u_type: string;
  }
}
