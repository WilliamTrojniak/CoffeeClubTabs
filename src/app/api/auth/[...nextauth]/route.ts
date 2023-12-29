import { AuthOptions } from "next-auth";
import NextAuth from "next-auth/next";
import GoogleProvider from "next-auth/providers/google"

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  callbacks: {
    jwt: async ({ token, profile }) => {
      if(profile) {
        token.sub = profile.sub;
      }
      return token;
    },
    session: async ({ session, token, }) => {
      session.user.id = token.sub;
      return session;
    }
  },
} satisfies AuthOptions;

export const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
