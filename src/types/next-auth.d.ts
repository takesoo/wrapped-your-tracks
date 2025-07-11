import type { Session as NextAuthSession } from 'next-auth';
import type { JWT as NextAuthJWT } from 'next-auth/jwt';

declare module 'next-auth' {
  interface Session extends NextAuthSession {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends NextAuthJWT {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
  }
}
