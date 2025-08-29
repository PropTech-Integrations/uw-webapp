//**********************************************************************************
// Projects Page Server Load
// This file loads the projects data from the server and returns it to the client.
// **********************************************************************************

// SvelteKit Imports
import { error } from '@sveltejs/kit';

// Import the type for the server load function
import type { PageServerLoad } from './$types';

// ---------------------------------------------------------------------------------
// Import the GraphQL helper for making HTTP requests to AppSync
import { gql } from '$lib/realtime/websocket/AppSyncWsClient';
// Import the GraphQL query and mutation strings
import { Q_GET_PROJECT } from '$lib/realtime/graphql/Projects/queries';

// Import the UserItem type definition
import type { Project } from '$lib/types/Project';

// Define the server-side load function for this page
export const load: PageServerLoad = async ({ params, cookies }) => {
	const { projectId } = params;

	const idToken = cookies.get('id_token');
	if (!idToken) {
		error(401, 'Not Authorized');
	}

	// Call the GraphQL endpoint with the Q_LIST query and a limit of 50 items
	// The response is expected to have a listMyProjects object with an items array
	const response = await gql<{ getProject: Project }>(Q_GET_PROJECT, { id: projectId }, idToken);

	// Check if response is null or undefined
	if (!response) {
		console.error('GraphQL response is null or undefined');
		return { items: [], nextToken: null, idToken: idToken, error: 'No response from GraphQL' };
	}

	// Check if listMyProjects is null or undefined
	if (!response.getProject) {
		console.error('getProject is null or undefined in response');
		return {
			project: null,
			idToken: idToken,
			error: 'getProject is null in response'
		};
	}
	return {
		project: response.getProject,
		idToken: idToken
	};
};
