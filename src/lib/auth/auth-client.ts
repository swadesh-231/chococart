import { createAuthClient } from 'better-auth/react';

// No baseURL: better-auth falls back to `window.location.origin`, and the auth
// routes live in this same Next app. Pinning a hostname here breaks every
// origin that isn't the pinned one (Vercel preview URLs, localhost) with an
// opaque CORS error.
export const authClient = createAuthClient();

export const { signIn, signUp, signOut, useSession, getSession } = authClient;
