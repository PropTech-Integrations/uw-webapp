import { PUBLIC_GRAPHQL_HTTP_ENDPOINT } from "$env/static/public";

/**
 * Executes a GraphQL query or mutation against the AppSync HTTP endpoint.
 *
 * @template T - The expected shape of the response data.
 * @param {string} query - The GraphQL query or mutation string.
 * @param {Record<string, any>} [variables={}] - Variables for the GraphQL operation.
 * @param {string} idToken - The Cognito ID token for authentication.
 * @returns {Promise<T>} - Resolves with the data returned from the GraphQL endpoint.
 * @throws {Error} - Throws if the response contains GraphQL errors.
 */
export async function gql<T>(
	query: string,
	variables: Record<string, any> = {},
	idToken: string
): Promise<T> {
	const headers: Record<string, string> = {
		'content-type': 'application/json',
		Authorization: idToken
	};
	// console.log('GraphQL Request ------------------------------------');
	// console.log('headers', headers);
	// console.log('body', JSON.stringify({ query, variables }));
	// console.log('----------------------------------------------------');
	const res = await fetch(PUBLIC_GRAPHQL_HTTP_ENDPOINT, {
		method: 'POST',
		headers,
		body: JSON.stringify({ query, variables })
	});
	const body = await res.json();
	if (body.errors?.length) throw new Error(body.errors.map((e: any) => e.message).join('; '));
	return body.data as T;
}
