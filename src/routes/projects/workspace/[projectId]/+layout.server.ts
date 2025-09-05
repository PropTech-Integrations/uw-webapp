import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { Q_GET_PROJECT_BY_ID } from '$lib/realtime/graphql/queries/Project';
import { Q_DOCUMENT_BY_ID } from '$lib/realtime/graphql/queries/Document';
import { gql } from '$lib/realtime/graphql/requestHandler';
import type { Project } from '$lib/types/Project';
import type { Document } from '$lib/types/Document';
import { Q_INSIGHT_BY_DOCHASH } from '$lib/realtime/graphql/queries/Insight';
import type { Insight } from '$lib/types/Insight';

export const load: LayoutServerLoad = async ({ params, cookies }) => {
	console.log("Starting layout.server.ts")
	let { projectId } = params;

	let documents: Document[] = [];

	const idToken = cookies.get('id_token');
	if (!idToken) {
		throw error(401, 'Not Authorized');
	}

	const response = await gql<{ project: Project }>(Q_GET_PROJECT_BY_ID, { id: projectId }, idToken);
	// console.log("response", response);
	if (!response) {
		throw error(404, 'Project not found');
	}

	if (!response.project) {
		throw error(404, 'Project not found');
	}

	for (const document of response.project.documents) {
		console.log("document", document);
		const documentResponse = await gql<{ document: Document }>(
			Q_DOCUMENT_BY_ID,
			{ id: document.id },
			idToken
		);
		if (!documentResponse) {
			throw error(404, 'Document not found');
		}
		if (!documentResponse.document) {
			throw error(404, 'Document not found');
		}
		
		// console.log("documentResponse", documentResponse);

		const insightsResponse = await gql<{ listInsightsByDocument: { items: Insight[] } }>(
			Q_INSIGHT_BY_DOCHASH,
			{ docHash: documentResponse.document.docHash },
			idToken
		);

		// console.log("insightsResponse", JSON.stringify(insightsResponse, null, 2));
		// if (!insightsResponse) {
		// 	throw error(404, 'Insights not found');
		// }
		// if (!insightsResponse) {
		// 	throw error(404, 'Insights not found');
		// }
		// documentResponse.document.insights = insightsResponse.insights;

		documentResponse.document.insights = { items: insightsResponse.listInsightsByDocument.items };
		const sortedPages = documentResponse.document.pages?.items?.sort(
			(a, b) => a.pageNumber - b.pageNumber
		);
		documentResponse.document.pages!.items = sortedPages!;

		const sortedTexts = documentResponse.document.texts?.items?.sort(
			(a, b) => a.pageNumber - b.pageNumber
		);
		documentResponse.document.texts!.items = sortedTexts!;

		documents.push(documentResponse.document);
	}


	console.log("documents", JSON.stringify(documents, null, 2));
	return {
		project: response.project,
		idToken: idToken,
		documents: documents
	};
};
