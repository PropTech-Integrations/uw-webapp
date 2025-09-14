import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { Q_GET_PROJECT_BY_ID } from '$lib/realtime/graphql/queries/Project';
import { Q_DOCUMENT_BY_ID } from '$lib/realtime/graphql/queries/Document';
import { gql } from '$lib/realtime/graphql/requestHandler';
import type { Project } from '$lib/types/Project';
import type { Document } from '$lib/types/Document';
import { Q_INSIGHT_BY_DOCHASH } from '$lib/realtime/graphql/queries/Insight';
import type { Insight } from '$lib/types/Insight';

export const load: LayoutServerLoad = async ({ params, cookies, url }) => {
	// console.log('Starting layout.server.ts');
	// console.log('url', url);
	// console.log('params', params);
	let { projectId } = params;

	const newProject = url.searchParams.get('new');
	// const projectId = url.pathname.split('/').at(-2);

	// console.log('projectId', projectId);
	// console.log('newProject', newProject);

	let documents: Document[] = [];

	const idToken = cookies.get('id_token');
	if (!idToken) {
		throw error(401, 'Not Authorized');
	}

	// If this is a new project request, return empty data without trying to fetch the project
	if (newProject === '1') {
		console.log('New project requested, returning empty data');
		return {
			project: null,
			idToken: idToken,
			documents: documents,
			isNewProject: true
		};
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
		// console.log("document", document);
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

	// console.log("documents", JSON.stringify(documents, null, 2));
	return {
		project: response.project,
		idToken: idToken,
		documents: documents,
		isNewProject: false
	};
};
