import { error } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { Q_GET_PROJECT_BY_ID } from '$lib/realtime/graphql/queries/Project';
import { Q_DOCUMENT_BY_ID } from '$lib/realtime/graphql/queries/Document';
import { gql } from '$lib/realtime/graphql/requestHandler';
import type { Project } from '$lib/types/Project';
import type { Document } from '$lib/types/Document';

export const load: LayoutServerLoad = async ({ params, cookies }) => {
	let { projectId } = params;

	let documents: Document[] = [];

	const idToken = cookies.get('id_token');
	if (!idToken) {
		throw error(401, 'Not Authorized');
	}

	const response = await gql<{ project: Project }>(Q_GET_PROJECT_BY_ID, { id: projectId }, idToken);
	if (!response) {
		throw error(404, 'Project not found');
	}

	if (!response.project) {
		throw error(404, 'Project not found');
	}

	for (const document of response.project.documents) {
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

	return {
		project: response.project,
		idToken: idToken,
		documents: documents
	};
};
