// src/routes/auth/callback/+server.ts
import { COGNITO_CLIENT_ID, COGNITO_DOMAIN, COGNITO_REDIRECT_URI } from '$env/static/private';
import { error, redirect, type RequestHandler } from '@sveltejs/kit';

export const GET: RequestHandler = async (params) => {
	// Log incoming request parameters for debugging
	// console.log('--------------------------------');
	// console.log("Entered callback route");
	// console.log('params: ', params);
	const { cookies, url } = params;
	const code = url.searchParams.get('code');

	// Retrieve PKCE code verifier from cookies
	const codeVerifier = cookies.get('pkce_verifier');

	// Validate presence of authorization code and PKCE verifier
	if (!code || !codeVerifier) {
		throw error(400, 'Missing/invalid OAuth2 code, state, or PKCE verifier');
	}

	// Prepare headers for the token request
	const myHeaders = new Headers();
	myHeaders.append('Content-Type', 'application/x-www-form-urlencoded');
	myHeaders.append('Accept', 'application/json');

	// Construct the request body for token exchange
	const urlencoded = new URLSearchParams();
	urlencoded.append('grant_type', 'authorization_code');
	urlencoded.append('client_id', COGNITO_CLIENT_ID);
	urlencoded.append('code', code);
	urlencoded.append('redirect_uri', COGNITO_REDIRECT_URI);
	urlencoded.append('code_verifier', codeVerifier);

	// Define request options for the token exchange
	const requestOptions: RequestInit = {
		method: 'POST',
		headers: myHeaders,
		body: urlencoded
	};

	// Log environment variables and request details for debugging
	// console.log('COGNITO_DOMAIN: ', COGNITO_DOMAIN);
	// console.log('COGNITO_CLIENT_ID: ', COGNITO_CLIENT_ID);
	// console.log('COGNITO_REDIRECT_URI: ', COGNITO_REDIRECT_URI);
	// console.log('code: ', code);
	// console.log('codeVerifier: ', codeVerifier);

	// Send request to exchange authorization code for tokens
	const response = await fetch(`${COGNITO_DOMAIN}/oauth2/token`, requestOptions);

	// Handle unsuccessful token exchange
	if (!response.ok) {
		const errorText = await response.text();
		console.error('Token exchange failed:', {
			status: response.status,
			statusText: response.statusText,
			error: errorText
		});
		throw redirect(302, '/auth/login');
	}

	// Parse the response to extract tokens
	const tokens = await response.json();

	// console.log('tokens: ', tokens);
	// Clean up cookies related to the authentication process
	cookies.delete('auth_state', { path: '/auth' });
	cookies.delete('pkce_verifier', { path: '/auth' });

	// Set session cookies with the received tokens
	cookies.set('id_token', tokens.id_token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax',
		path: '/',
		maxAge: tokens.expires_in
	});

	cookies.set('access_token', tokens.access_token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax',
		path: '/',
		maxAge: tokens.expires_in
	});

	cookies.set('refresh_token', tokens.refresh_token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'lax',
		path: '/',
		maxAge: tokens.expires_in
	});

	// Redirect to the home page after successful authentication
	throw redirect(302, '/');
};
