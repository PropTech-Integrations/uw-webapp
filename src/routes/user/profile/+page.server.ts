import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';
import { getUserProfile, decodeJwt } from '$lib/auth/cognito';

const COOKIE_ACCESS = 'cognito_access_token'; // your cookie name for the access token
const COOKIE_ID = 'cognito_id_token';         // your cookie name for the id token

export const load: PageServerLoad = async ({ cookies, url }) => {
  const accessToken = cookies.get(COOKIE_ACCESS);
  const idToken = cookies.get(COOKIE_ID);

  if (!accessToken || !idToken) {
    // Not signed in – bounce to Hosted UI
    const domain = process.env.COGNITO_DOMAIN!;               // e.g. https://your-domain.auth.us-west-2.amazoncognito.com
    const clientId = process.env.COGNITO_APP_CLIENT_ID!;
    const redirectUri = process.env.COGNITO_REDIRECT_URI!;    // e.g. https://yourapp.com/auth/callback
    const state = encodeURIComponent(url.pathname);           // come back to /me
    throw redirect(302, `${domain}/login?client_id=${clientId}&response_type=code&scope=openid+email+profile&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`);
  }

  // 1) Authoritative attributes from the User Pool (requires AccessToken)
  const profile = await getUserProfile(accessToken);

  // 2) OIDC claims from ID token (fast, useful for UI)
  const claims = decodeJwt<Record<string, unknown>>(idToken);

  return {
    profile,
    claims
  };
};
