import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { verifyPassword } from "@/lib/password";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: {
    signIn: "/",
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const username = credentials?.username?.trim();
        const password = credentials?.password;
        if (!username || !password) return null;

        const prisma = (await import("@/lib/prisma")).default;
        const user = await prisma.user.findUnique({
          where: { u_account: username },
        });
        if (!user) return null;

        const valid = await verifyPassword(password, String(user.u_password ?? ""));
        if (!valid) return null;

        return {
          id: String(user.u_id),
          name: user.u_name,
          email: user.u_email,
          account: user.u_account,
          type: user.u_type,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.u_id = user.id;
        token.u_account = user.account;
        token.u_type = user.type;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.u_id as string;
        session.user.account = token.u_account as string;
        session.user.type = token.u_type as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
