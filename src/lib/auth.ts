import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { upsertUser } from "./db";

const authSecret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
const googleClientId = process.env.AUTH_GOOGLE_ID ?? process.env.GOOGLE_CLIENT_ID;
const googleClientSecret =
  process.env.AUTH_GOOGLE_SECRET ?? process.env.GOOGLE_CLIENT_SECRET;

const providers = [];
if (googleClientId && googleClientSecret) {
  providers.push(
    Google({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    })
  );
} else {
  console.warn(
    "Google OAuth is not fully configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in production."
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: authSecret,
  trustHost: true,
  providers,
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
