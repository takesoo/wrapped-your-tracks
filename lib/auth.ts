import { NextAuthOptions } from 'next-auth';
import SpotifyProvider from 'next-auth/providers/spotify';

const scopes = [
  'user-read-email',
  'user-read-private',
  'user-top-read',
  'user-read-recently-played',
  'playlist-read-private',
  'playlist-read-collaborative',
].join(' ');

export const authOptions: NextAuthOptions = {
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID!,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: scopes,
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
      }
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.expiresAt = token.expiresAt;
      return session;
    },
  },
  pages: {
    signIn: '/',
  },
};
