// /**
//  * +page.server.ts
//  * 
//  * Server-side load function for the Document Analysis page.
//  * Fetches document and page data for a given project using a GraphQL query.
//  * Returns the document pages to the client for rendering.
//  * 
//  * Route: /projects/workspace/[projectId]/document-analysis
//  */

// import { error } from '@sveltejs/kit';
// import type { PageServerLoad } from './$types';
// import { gql } from '$lib/realtime/graphql/requestHandler';
// import { Q_DOCUMENT_BY_ID } from '$lib/realtime/graphql/queries/Document';
// import type { DocumentAndPages } from '$lib/types/Document';

// // Server-side load function for the Document Analysis page
// export const load: PageServerLoad = async ({ params, cookies }) => {
// 	// Retrieve the id_token from cookies for authentication
// 	const idToken = cookies.get('id_token');
// 	if (!idToken) {
// 		// If no token, user is not authorized
// 		error(401, 'Not Authorized');
// 	}
// 	const projectId = params.projectId; // Get projectId from route params

// 	// Call the GraphQL endpoint to fetch document and pages data
// 	const response = await gql<{ document: DocumentAndPages }>(
// 		Q_DOCUMENT_BY_ID,
// 		{ id: projectId }, // Pass projectId as variable
// 		idToken
// 	);

// 	// Log the response for debugging
// 	console.log(response);

// 	// If no response, throw 404 error
// 	if (!response) {
// 		throw error(404, 'Project not found');
// 	}

// 	// If document is missing in the response, throw 404 error
// 	if (!response.document) {
// 		throw error(404, 'Project not found');
// 	}

// 	// Return the document and its pages to the client
// 	return {
// 		document: response.document
// 	};
// };
