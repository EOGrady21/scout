import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { upsertUser } from "./db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return false;
      try {
        await upsertUser({
          id: user.id!,
          name: user.name ?? null,
          email: user.email,
          image: user.image ?? null,
        });
      } catch (err) {
        console.error("Failed to upsert user:", err);
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user?.id) {
        token.sub = user.id;
      }
      return token;
    },
  },
  pages: {
    signIn: "/",
  },
});
