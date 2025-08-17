// Import SvelteKit's error utility (not used here, but available for error handling)
import { error } from '@sveltejs/kit';
// Import the type for the server load function
import type { PageServerLoad } from './$types';
// Import the GraphQL helper for making HTTP requests to AppSync
import { gql } from '$lib/realtime/websocket/AppSyncWsClient';
// Import the GraphQL query string for listing user items
import { Q_LIST } from '$lib/realtime/graphql/queries';
// Import the UserItem type definition
import type { UserItem } from '$lib/types/UserItem';

// Define the server-side load function for this page
export const load: PageServerLoad = async ({ params, cookies }) => {
	console.log(cookies.getAll());
	try {
		const idToken = cookies.get('id_token');
		console.log('idToken from cookies', idToken);
		if (!idToken) {
			error(401, 'Not Authorized');
		}

		// Call the GraphQL endpoint with the Q_LIST query and a limit of 50 items
		// The response is expected to have a listUserItems object with an items array
		const response = await gql<{ listUserItems: { items: UserItem[] } }>(Q_LIST, { limit: 50 }, idToken);
		// Log the full response for debugging purposes
		console.log('response', JSON.stringify(response, null, 2));
		// Return the items array to the page as props
		return { items: response.listUserItems.items, idToken: idToken };
	} catch (error: any) {
		// If an error occurs, log it and return an empty items array with the error message
		console.error('Error loading data:', error);
		return { items: [], error: error.message };
	}
};
